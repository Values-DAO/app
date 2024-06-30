import ApiKey from "@/models/apikey";
import crypto from "crypto";
import mongoose from "mongoose";
import {headers} from "next/headers";
import {NextResponse} from "next/server";
export async function POST(req: any) {
  const headersList = headers();

  const apiKey = headersList.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({
      error: "Missing API key",
      status: 401,
    });
  }

  if (apiKey !== process.env.MASTER_API_KEY) {
    return NextResponse.json({
      error: "Invalid API key",
      status: 401,
    });
  }
  try {
    await mongoose.connect(process.env.NEW_MONGODB_URI || "");
    const {permissions} = await req.json();

    const key = crypto.randomBytes(32).toString("hex");

    await ApiKey.create({
      key,
      permissions: permissions ?? ["READ"],
    });

    return NextResponse.json({key, permissions});
  } catch (error) {
    return NextResponse.json(error);
  }
}
