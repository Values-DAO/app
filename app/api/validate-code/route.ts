import InviteCodes from "@/models/inviteCodes";
import User from "@/models/user";
import mongoose from "mongoose";
import {NextResponse} from "next/server";

export async function GET(req: any) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const email = searchParams.get("email");
  if (!code || !email) {
    return NextResponse.json({status: 400, error: "Invalid code or email"});
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    const existingCode = await InviteCodes.findOne({code});
    if (!existingCode) return NextResponse.json({status: 404, isValid: false});

    if (existingCode.claimed === true) {
      return NextResponse.json({status: 400, isValid: false});
    }

    existingCode.claimedBy = email;
    existingCode.claimed = true;

    const user = await User.findOne({email});

    user.isVerified = true;
    await user.save();

    await existingCode.save();

    return NextResponse.json({status: 200, isValid: true});
  } catch (error) {
    return NextResponse.json({status: 500, error});
  }
}
