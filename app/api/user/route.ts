import User, {IUser} from "@/models/user";
import {NextRequest, NextResponse} from "next/server";
import {generateInviteCodes} from "@/lib/generate-invite-code";
import InviteCodes from "@/models/inviteCodes";
import {headers} from "next/headers";
import validateApiKey from "@/lib/validate-key";
import connectToDatabase from "@/lib/connect-to-db";

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
      email,
      wallets = [],
      method,
      mintedValues,
      balance,
      type,
      farcaster,
    } = await req.json();
    console.log(email, wallets, method, mintedValues, balance, type, farcaster);
    // Request validation
    if (!method) {
      return NextResponse.json({error: "Method is required", status: 400});
    }
    if (!email && !farcaster) {
      return NextResponse.json({
        error: "Email or farcaster is required",
        status: 400,
      });
    }
    let user;
    if (email) {
      user = await User.findOne({email});
    } else if (farcaster) {
      user = await User.findOne({farcaster});
    }

    // Handle different methods
    switch (method) {
      case "create_user":
        if (user) {
          return NextResponse.json({error: "User already exists", status: 400});
        }
        const codes = generateInviteCodes();
        const createdUser = await User.create({
          wallets,
          balance: 5,
          inviteCodes: codes.map((inviteCode) => ({code: inviteCode})),
          ...(farcaster ? {farcaster} : {}),
          ...(email ? {email} : {}),
        });

        const inviteCodesData = codes.map((inviteCode) => ({
          code: inviteCode,
          codeOwner: email,
        }));
        await InviteCodes.insertMany(inviteCodesData);

        return NextResponse.json(createdUser);
      case "update":
        console.log("Updating user");
        if (!user) {
          return NextResponse.json({error: "User not found", status: 404});
        }
        if (mintedValues) {
          user.mintedValues.push(...mintedValues);
        }
        if (farcaster) {
          user.farcaster = Number(farcaster);
        }
        if (balance) {
          user.balance =
            type === "add" ? user.balance + balance : user.balance - balance;
        }
        await user.save();
        console.log("User updated", user);

        return NextResponse.json({user, status: 200});
      case "add_wallet":
        if (!user) {
          return NextResponse.json({error: "User not found", status: 404});
        }
        for (const w of wallets) {
          if (!user.wallets.includes(w)) user.wallets.push(w);
        }
        await user.save();
        return NextResponse.json({user, status: 200});
      default:
        return NextResponse.json({error: "Invalid method", status: 400});
    }
  } catch (error) {
    return NextResponse.json({
      error: error || "Internal Server Error",
      status: 500,
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
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get("email");
    const fid = searchParams.get("fid");

    if (email && fid) {
      const user = await User.findOne({email, farcaster: fid});
      if (!user) {
        return NextResponse.json({error: "User not found", status: 404});
      }
      return NextResponse.json({user, status: 200});
    } else if (email) {
      const user = await User.findOne({email});
      if (!user) {
        return NextResponse.json({error: "User not found", status: 404});
      }
      return NextResponse.json({user, status: 200});
    } else if (fid) {
      const user = await User.findOne({farcaster: fid});
      if (!user) {
        return NextResponse.json({error: "User not found", status: 404});
      }
      return NextResponse.json({user, status: 200});
    } else {
      const users = await User.find({});
      return NextResponse.json({users, status: 200});
    }
  } catch (error) {
    return NextResponse.json({
      error: error || "Internal Server Error",
      status: 500,
    });
  }
}
