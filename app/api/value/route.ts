import ApiKey from "@/models/apikey";
import Value from "@/models/values";
import mongoose from "mongoose";
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
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    const {name, value, email} = await req.json();
    if (value && email) {
      if (Array.isArray(value)) {
        for (const v of value) {
          const existingValue = await Value.findOne({name: v});
          if (existingValue.minters.includes(email)) {
            continue;
          }
          existingValue.minters.push(email);
          await existingValue.save();
        }
        return NextResponse.json({status: 200});
      } else {
        const existingValue = await Value.findOne({name: value});

        if (existingValue.minters.includes(email)) {
          return NextResponse.json({status: 200, value: existingValue});
        }
        existingValue.minters.push(email);
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
    return NextResponse.json({status: 500, error});
  }
}

export async function GET(req: NextRequest) {
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
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
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
    return NextResponse.json({status: 500, error});
  }
}
