import Project from "@/models/project";
import mongoose from "mongoose";
import {NextApiRequest} from "next";
import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
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

  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    const projects = await Project.find({});
    const nextId = projects.length + 1;
    const project = await Project.create({
      id: nextId,
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
    console.log(error);
    return NextResponse.json({status: 500, error});
  }
}

export async function GET(req: any) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    if (id) {
      const project = await Project.findOne({id});
      return NextResponse.json({status: 200, message: "Success", project});
    }
    const projects = await Project.find({}, {__v: 0, _id: 0});
    return NextResponse.json({status: 200, message: "Success", projects});
  } catch (error) {
    return NextResponse.json({status: 500, error});
  }
}
