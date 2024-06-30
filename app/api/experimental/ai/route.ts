import User from "@/models/user";
import {NextRequest, NextResponse} from "next/server";

import connectToDatabase from "@/lib/connect-to-db";
import {fetchCastsForUser} from "@/lib/fetch-user-casts";

import {fetchUserTweets} from "@/lib/fetch-user-tweets";
import {GetFIDForUsername} from "@/lib/get-username-fid";
import {generateValuesForUserExp} from "@/lib/experimental/generate-user-values-per-casts";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get("email");
    const twitter = searchParams.get("twitter");
    const username = searchParams.get("username");
    const twitter_userId = searchParams.get("twitter_userId");

    if (!username && !twitter) {
      return NextResponse.json({
        status: 400,
        error: "farcaster fid or Twitter handle is required",
      });
    }
    let user;
    let fid = await GetFIDForUsername(username as string);
    user = await User.findOne({
      ...(email ? {email} : {}),
      ...(twitter ? {twitter} : {}),
      ...(fid ? {farcaster: fid} : {}),
    });

    if (!user) {
      user = await User.create({
        ...(email ? {email} : {}),
        ...(twitter ? {twitter} : {}),
        ...(fid ? {farcaster: fid} : {}),
      });
    }

    let generatedValues: any | undefined = undefined;
    if (twitter && twitter_userId) {
      const tweets = await fetchUserTweets(twitter_userId);
      if (tweets.length < 100) {
        return NextResponse.json({
          status: 400,
          error: "User has less than 100 tweets",
        });
      }
      generatedValues = await generateValuesForUserExp(tweets);
    } else if (fid) {
      const casts = await fetchCastsForUser(fid, 200);
      if (casts.length < 100) {
        return NextResponse.json({
          status: 400,
          error: "User has less than 100 casts",
        });
      }
      generatedValues = await generateValuesForUserExp(casts);
    }

    return NextResponse.json({
      status: 200,
      generatedValues,
    });
  } catch (error) {
    return NextResponse.json({
      error: error || "Internal Server Error",
      status: 500,
    });
  }
}
