import connectToDatabase from "@/lib/connect-to-database";
import axios from "axios";
import {headers} from "next/headers";
import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
  const {values, tokenId} = await req.json();
  // expect values = [{name:string, newWeightage:Number}]
  await connectToDatabase();
  if (!Array.isArray(values)) {
    return NextResponse.json({
      status: 400,
      error: "Invalid input: 'values' must be an array.",
    });
  }

  try {
    const {data} = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        pinataContent: {
          name: `ValuesDAO #${tokenId}`,
          description:
            "This is a value NFT generated via ValuesDAO, each NFT represents a ValuesDAO Profile.",
          image:
            "https://tomato-left-possum-965.mypinata.cloud/ipfs/QmX3E8eg85itRjcTHu9ZRbU2JAu1R9YPFDLYg5ijD2Gc6n",
          attributes: values.map((value) => ({
            trait_type:
              value.name.toString().charAt(0).toUpperCase() +
              value.name.toString().slice(1),
            value: value.newWeightage.toString(),
          })),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({
      cid: `https://tomato-left-possum-965.mypinata.cloud/ipfs/${data.IpfsHash}`,
      message: "success",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      error: "Internal server error.",
    });
  }
}

export const GET = POST;
