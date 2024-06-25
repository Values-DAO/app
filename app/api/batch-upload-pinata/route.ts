import connectToDatabase from "@/lib/connect-to-db";
import validateApiKey from "@/lib/validate-key";
import Value from "@/models/values";
import axios from "axios";
import {headers} from "next/headers";
import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
  const {values, weightages} = await req.json();
  console.log("Values:", values);
  console.log("Weightages:", weightages);
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
      if (
        existingNames.includes(value.toLowerCase()) &&
        weightages === undefined
      ) {
      } else {
        // upload new values to the database and pinata
        const response = await axios.post(
          "https://api.pinata.cloud/pinning/pinJSONToIPFS",
          {
            pinataContent: {
              name: `${value}`,
              description:
                "This is a value NFT generated via ValuesDAO, each NFT represents a unique Human Value.",
              image:
                "https://gateway.pinata.cloud/ipfs/QmX3E8eg85itRjcTHu9ZRbU2JAu1R9YPFDLYg5ijD2Gc6n",
              attributes: [
                {
                  trait_type: "Weight",
                  value: weightages
                    ? weightages[values.indexOf(value)] === 0
                      ? 1
                      : weightages[values.indexOf(value)]
                    : 1,
                },
              ],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
              "Content-Type": "application/json",
            },
          }
        );
        const valueObject = {
          value: {
            metadata: {
              name: value,
              description: `This is a value NFT generated via ValuesDAO, each NFT represents a unique Human Value. This NFT represents the value: ${value}.`,
              image: `https://gateway.pinata.cloud/ipfs/QmX3E8eg85itRjcTHu9ZRbU2JAu1R9YPFDLYg5ijD2Gc6n`,
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
