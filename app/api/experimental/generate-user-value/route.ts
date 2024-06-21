import User from "@/models/user";
import {NextRequest, NextResponse} from "next/server";
import {headers} from "next/headers";
import validateApiKey from "@/lib/validate-key";
import connectToDatabase from "@/lib/connect-to-db";
import {fetchCastsForUser} from "@/lib/fetch-user-casts";
import {generateValuesForUser} from "@/lib/generate-user-values-per-casts";
import {fetchUserTweets} from "@/lib/fetch-user-tweets";
import {sendDirectCast} from "@/lib/direct-cast";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    console.log("New request to generate user values");
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
    const twitter = searchParams.get("twitter");
    const fid = searchParams.get("fid");
    const twitter_userId = searchParams.get("twitter_userId");

    if (!fid && !twitter) {
      console.log("Farcaster fid or Twitter handle is required");
      return NextResponse.json({
        status: 400,
        error: "farcaster fid or Twitter handle is required",
      });
    }

    let generatedValues: string[] = [];
    if (twitter && twitter_userId) {
      const tweets = await fetchUserTweets(twitter_userId);
      if (tweets.length < 100) {
        return NextResponse.json({
          status: 400,
          error: "User has less than 100 tweets",
        });
      }
      generatedValues = (await generateValuesForUser(tweets)) ?? [];
    } else if (fid) {
      const casts = await fetchCastsForUser(fid, 200);
      if (casts.length < 100) {
        console.log("User has less than 100 casts", Number(fid));
        await sendDirectCast({
          recipientFid: Number(fid),
          message:
            "You have less than 100 casts. We would require at least 100 casts to meaningfully generate your values using AI. Visit https://app.valuesdao.io to manually mint your values.",
        });
        return NextResponse.json({
          status: 400,
          error: "User has less than 100 casts",
        });
      }
      generatedValues = (await generateValuesForUser(casts)) ?? [];
    }
    await sendDirectCast({
      recipientFid: Number(fid),
      message: [
        "gm",
        "We have analysed your warpcast casts and generated your values",
        ...generatedValues.map((value) => `* ${value}`),
        `Mint your values; https://valuesdao-frames.vercel.app/api/mint-values/${fid}`,
      ].join("\n"),
    });
    const user = await User.findOneAndUpdate(
      {
        ...(email ? {email} : {}),
        ...(twitter ? {twitter} : {}),
        ...(fid ? {farcaster: fid} : {}),
      },
      {
        $set: {
          ...(twitter_userId
            ? {"aiGeneratedValues.twitter": Array.from(generatedValues)}
            : {"aiGeneratedValues.warpcast": Array.from(generatedValues)}),
        },
      },
      {new: true, upsert: true}
    );

    await axios.post(
      `${process.env.NEXT_PUBLIC_HOST}/api/batch-upload-pinata`,
      {
        values: generatedValues,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": `${process.env.NEXT_PUBLIC_NEXT_API_KEY}`,
        },
      }
    );
    return NextResponse.json({
      status: 200,
      user,
    });
  } catch (error) {
    return NextResponse.json({
      error: error || "Internal Server Error",
      status: 500,
    });
  }
}
