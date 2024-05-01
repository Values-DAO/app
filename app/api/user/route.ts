import mongoose from "mongoose";
import User, {IUser} from "@/models/user";
import {NextRequest, NextResponse} from "next/server";
import {generateInviteCodes} from "@/lib/generate-invite-code";
import InviteCodes from "@/models/inviteCodes";

export async function POST(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    const {
      email,
      username,
      wallets = [],
      method,
      mintedValues,
      balance,
      type,
      farcaster,
    } = await req.json();

    if (!email || !method) {
      return NextResponse.json({error: "Missing required fields"});
    }

    if (method === "create_user") {
      const userExists = await User.findOne({email});
      if (userExists) {
        return NextResponse.json({error: "User already exists", status: 400});
      }
      const codes = generateInviteCodes();
      const user = await User.create({
        email,
        username,
        wallets,
        balance,
        inviteCodes: codes.map((inviteCode) => ({
          code: inviteCode,
        })),
        ...(farcaster ? {farcaster} : {}),
      });

      const inviteCodesData = codes.map((inviteCode) => ({
        code: inviteCode,
        codeOwner: email,
      }));

      await InviteCodes.insertMany(inviteCodesData);

      return NextResponse.json(user);
    }

    const user = await User.findOne({email});

    if (method === "update") {
      if (mintedValues) {
        for (const mv of mintedValues) {
          user?.mintedValues.push(mv);
        }
      }
      if (farcaster) {
        user.farcaster = Number(farcaster);
      }
      if (balance) {
        user.balance =
          type === "add" ? user.balance + balance : user.balance - balance;
      }
      await user?.save();
      return NextResponse.json({user, status: 200});
    }

    if (method === "add_wallet") {
      if (wallets) {
        for (const w of wallets) {
          if (!user?.wallets.includes(w)) user?.wallets.push(w);
        }
        await user?.save();
      }
      return NextResponse.json({user, status: 200});
    }

    return NextResponse.json({error: "Invalid method", status: 400});
  } catch (error) {
    return NextResponse.json({error: error, status: 500});
  }
}

export async function GET(req: any) {
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get("email");
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");

    if (email) {
      const user = await User.findOne({email});

      if (!user) {
        return NextResponse.json({error: "User not found", status: 404});
      }

      return NextResponse.json({user: user, status: 200});
    } else {
      const users = await User.find({});

      return NextResponse.json({user: users, status: 200});
    }
  } catch (error) {
    return NextResponse.json({error: error, status: 500});
  }
}
