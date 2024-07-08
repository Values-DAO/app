import connectToDatabase from "@/lib/connect-to-db";
import {fetchFarcasterUserWallets} from "@/lib/fetch-farcaster-user-wallets";
import validateApiKey from "@/lib/validate-key";
import User from "@/models/user";
import axios from "axios";
import {headers} from "next/headers";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const fid = searchParams.get("fid");
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

    if (!fid) {
      return NextResponse.json({
        status: 400,
        error: "fid is required",
      });
    }

    const user = await User.findOne({farcaster: fid});
    if (!user) {
      return NextResponse.json({
        status: 404,
        error: "User not found",
      });
    }
    return NextResponse.json({
      status: 200,
      fid: fid,
      values: user.aiGeneratedValues.warpcast,
      weightedValues: user.aiGeneratedValuesWithWeights.warpcast,
    });
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      body: {error: error},
    };
  }
}

export async function POST(req: NextRequest) {
  const {fid} = await req.json();
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

    if (!fid) {
      return NextResponse.json({
        status: 400,
        error: "fid is required",
      });
    }

    const user = await User.findOne({farcaster: fid});
    if (user) {
      return NextResponse.json({
        status: 409,
        error: "User already exists",
        fid: fid,
        values: user.aiGeneratedValues.warpcast,
        weightedValues: user.aiGeneratedValuesWithWeights.warpcast,
      });
    }

    const {data} = await axios.get(
      `${process.env.NEXT_PUBLIC_HOST}/api/v2/generate-user-value?fid=${fid}&includeweights=true`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    const wallets = await fetchFarcasterUserWallets(fid);
    const MintProfileResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_HOST}/api/v2/user`,
      {
        farcaster: fid,
        method: "mint_profile",
        wallets: wallets,
        values: data?.user?.aiGeneratedValues?.warpcast?.map(
          (value: string) => ({
            name: value,
            newWeightage: "1",
          })
        ),
      },
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY,
        },
      }
    );
    return NextResponse.json({
      status: 201,
      fid: fid,
      values: data.user.aiGeneratedValues.warpcast,
      weightedValues: data.user.aiGeneratedValuesWithWeights.warpcast,
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      body: {error: error},
    };
  }
}
