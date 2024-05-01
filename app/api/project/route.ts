import connectToDatabase from "@/lib/connect-to-db";
import validateApiKey from "@/lib/validate-key";
import Project from "@/models/project";
import {headers} from "next/headers";
import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const apiKey = headers().get("x-api-key");
    const {isValid, message, status} = await validateApiKey(apiKey, "WRITE");
    if (!isValid) {
      return NextResponse.json({
        status: status,
        error: message,
      });
    }
    const {
      name,
      description,
      coverImage,
      contractAddress,
      chainId,
      twitter,
      website,
      values,
      category,
    } = await req.json();
    if (!name || !description || !coverImage || !contractAddress || !chainId) {
      return NextResponse.json({status: 400, error: "Missing required fields"});
    }

    const project = await Project.create({
      name,
      description,
      coverImage,
      contractAddress,
      chainId,
      twitter,
      website,
      values,
      category,
    });
    return NextResponse.json({status: 200, message: "Success", project});
  } catch (error) {
    return NextResponse.json({
      status: 500,
      error: error,
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const apiKey = headers().get("x-api-key");
    const {isValid, message, status} = await validateApiKey(apiKey, "READ");
    if (!isValid) {
      return NextResponse.json({
        status: status,
        error: message,
      });
    }
    const id = req.nextUrl.searchParams.get("id");
    if (id) {
      const project = await Project.findOne({id}, {__v: 0, _id: 0});
      return NextResponse.json({status: 200, message: "Success", project});
    }
    const projects = await Project.find({}, {__v: 0, _id: 0});
    return NextResponse.json({status: 200, message: "Success", projects});
  } catch (error) {
    return NextResponse.json({
      status: 500,
      error: error,
    });
  }
}
