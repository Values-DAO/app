import connectToDatabase from "@/lib/connect-to-db";
import validateApiKey from "@/lib/validate-key";
import Value from "@/models/values";
import {headers} from "next/headers";
import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const apiKey = headers().get("x-api-key");
  const {isValid, message, status} = await validateApiKey(apiKey, "WRITE");
  if (!isValid) {
    return NextResponse.json({
      status: status,
      error: message,
    });
  }
  try {
    const {name, value, email, farcaster} = await req.json();

    if (!email && !farcaster) {
      return NextResponse.json({
        status: 400,
        error: "Email or farcaster is required",
      });
    }
    if (value) {
      if (Array.isArray(value)) {
        for (const v of value) {
          const existingValue = await Value.findOne({name: v});
          if (existingValue.minters.includes(email ?? farcaster)) {
            continue;
          }
          existingValue.minters.push(email ?? farcaster);
          await existingValue.save();
        }
        return NextResponse.json({status: 200});
      } else {
        const existingValue = await Value.findOne({name: value});

        if (existingValue.minters.includes(email ?? farcaster)) {
          return NextResponse.json({status: 200, value: existingValue});
        }
        existingValue.minters.push(email ?? farcaster);
        const updatedValue = await existingValue.save();
        return NextResponse.json({status: 200, value: updatedValue});
      }
    }
    if (!name && !value) {
      return NextResponse.json({error: "Name and value are required"});
    }
    try {
      const newValue = await Value.create({name, value});
      return NextResponse.json({status: 200, value: newValue});
    } catch (error) {
      return NextResponse.json({
        status: 500,
        error,
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: 500,
      error: error,
    });
  }
}

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const apiKey = headers().get("x-api-key");
  const {isValid, message, status} = await validateApiKey(apiKey, "READ");
  if (!isValid) {
    return NextResponse.json({
      status: status,
      error: message,
    });
  }
  try {
    const values = await Value.find({}, {__v: 0, _id: 0, "value._id": 0});

    const formattedValues = values.reduce((acc, item) => {
      acc[item.name] = {
        minters: item.minters,
        cid: item.value.cid,
        metadata: item.value.metadata,
      };
      return acc;
    }, {});

    return NextResponse.json(formattedValues);
  } catch (error) {
    return NextResponse.json({
      status: 500,
      error: error,
    });
  }
}
