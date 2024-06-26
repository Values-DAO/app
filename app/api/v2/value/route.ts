import connectToDatabase from "@/lib/connect-to-db";
import Value from "@/models/value";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const values = await Value.find(
      {},
      {
        _id: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      }
    );
    return NextResponse.json({
      values: values.map((value) => value.name),
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({
      error: error || "Internal Server Error",
      status: 500,
    });
  }
}

export async function POST(req: any) {
  try {
    await connectToDatabase();
    const {values} = await req.json();
    for (const value of values) {
      await Value.create({name: value});
    }
    const allValues = await Value.find();
    return NextResponse.json({
      message: "success",
      status: 201,
      values: allValues,
    });
  } catch (error) {
    return NextResponse.json({
      error: error || "Internal Server Error",
      status: 500,
    });
  }
}
