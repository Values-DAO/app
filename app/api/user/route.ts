import mongoose from "mongoose";
import User from "@/models/user";
import {NextRequest, NextResponse} from "next/server";

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
    } = await req.json();

    if (!email || !method) {
      return NextResponse.json({error: "Missing required fields"});
    }

    if (method === "create_user") {
      const user = await User.create({
        email,
        username,
        wallets,
      });
      return NextResponse.json(user);
    }

    const user = await User.findOne({email});

    if (method === "update") {
      if (mintedValues) {
        for (const mv of mintedValues) {
          user?.mintedValues.push(mv);
        }
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
