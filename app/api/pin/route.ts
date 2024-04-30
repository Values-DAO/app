import ApiKey from "@/models/apikey";
import axios from "axios";
import {headers} from "next/headers";
import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
  const headersList = headers();
  const apiKey = headersList.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({
      error: "Missing API key",
      status: 401,
    });
  }

  const apiKeyExists = await ApiKey.findOne({
    key: apiKey,
  });

  if (!apiKeyExists) {
    return NextResponse.json({
      error: "Invalid API key",
      status: 401,
    });
  }
  if (
    apiKeyExists &&
    !apiKeyExists.permissions.includes("WRITE") &&
    !apiKeyExists.permissions.includes("*")
  ) {
    return NextResponse.json({
      error: "You don't have permission to write",
      status: 403,
    });
  }
  const {imageUrl, name} = await req.json();
  try {
    // Download the image
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    // Create Blob from array buffer
    const imageBlob = new Blob([response.data]);

    // Create form data for Pinata API
    const form = new FormData();
    form.append("file", imageBlob, `${name}.png`);

    // Make POST request to Pinata API
    const pinataResponse = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return NextResponse.json({
      status: 200,
      message: "Success",
      cid: pinataResponse.data.IpfsHash,
    });
  } catch (error) {
    return NextResponse.json({status: 500, error});
  }
}
