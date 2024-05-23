import connectToDatabase from "@/lib/connect-to-db";
import validateApiKey from "@/lib/validate-key";
import Value from "@/models/values";
import axios from "axios";
import {headers} from "next/headers";
import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
  const {values} = await req.json();
  await connectToDatabase();
  const apiKey = headers().get("x-api-key");
  const {isValid, message, status} = await validateApiKey(apiKey, "WRITE");
  if (!isValid) {
    return NextResponse.json({
      status: status,
      error: message,
    });
  }
  if (!Array.isArray(values)) {
    return NextResponse.json({
      status: 400,
      error: "Invalid input: 'values' must be an array.",
    });
  }

  try {
    const cidsToReturn = [];
    // Assuming `values` is an array of objects with a 'name' property
    const existingValues = await Value.find({
      name: {$in: values.map((value) => value.toLowerCase())}, // Ensure you're mapping to the 'name' property correctly
    });
    console.log("Existing values:", existingValues);
    // Mapping existing values to their names for easier comparison
    const existingNames = existingValues.map((ev) => ev.name); // Convert to lowercase for case-insensitive comparison
    cidsToReturn.push(...existingValues.map((ev) => ev.value.cid));
    // Check each value in the input array
    for (const value of values) {
      // Changed to for...of loop
      if (existingNames.includes(value.toLowerCase())) {
        // Convert to lowercase for case-insensitive comparison
        console.log("Existing value:", value);
      } else {
        // upload new values to the database and pinata
        const response = await axios.post(
          "https://api.pinata.cloud/pinning/pinJSONToIPFS",
          {
            pinataContent: {
              name: value, // Ensure you're using value.name
              description:
                "This is a value NFT generated via ValuesDAO, each NFT represents a unique Human Value.",
              image: "generatedImage",
            },
          },
          {
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyZGVhNjBhOC1iYTNkLTQyMmItODkzNi1mYjQ5YWFmNjlhOWYiLCJlbWFpbCI6InNhbmtoeWFzaWRkZXNoN0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZDZkZjBlMjcyNmYxODU5NmQxODciLCJzY29wZWRLZXlTZWNyZXQiOiJhNjk1YzVmMTJhZDI5MTcwZTI0OTk4YTA2YTU3NzFlNzNhZTZjN2Q0ODk4NzU2MjQxYTEwZDY3NzQ5MjA1ZDBjIiwiaWF0IjoxNzE2MzYzMzE2fQ.steB1PRirX7T-J93BOtMjR2MvtTaxxcJDRSK35CYSpY`,
              "Content-Type": "application/json",
            },
          }
        );
        const valueObject = {
          value: {
            metadata: {
              name: value, // Ensure you're using value.name
              description: `This is a value NFT generated via ValuesDAO, each NFT represents a unique Human Value. This NFT represents the value: ${value}.`,
              image: `https://gateway.pinata.cloud/ipfs/QmetoKUn658fkYqaK5mkiurTpY3Dk3VTEoAGSbEky8PqaA`,
            },
            cid: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
          },
          hasMintedValue: false,
        };

        const newValue = await Value.create({
          name: valueObject.value.metadata.name,
          value: valueObject.value,
          minters: [],
        });

        cidsToReturn.push(valueObject.value.cid);
      }
    }

    const valuesToReturn = await Value.find();
    return NextResponse.json({
      status: 200,
      message: "Success",
      values: valuesToReturn,
      cid: cidsToReturn,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      error: "Internal server error.",
    });
  }
}
