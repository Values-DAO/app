import User from "@/models/user";
import {NextRequest, NextResponse} from "next/server";
import {headers} from "next/headers";
import validateApiKey from "@/lib/validate-key";
import connectToDatabase from "@/lib/connect-to-db";
import {fetchCastsForUser} from "@/lib/fetch-user-casts";
import {generateValuesForUser} from "@/lib/generate-user-values-per-casts";
import {fetchUserTweets} from "@/lib/fetch-user-tweets";

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
    const twitter = searchParams.get("twitter");
    const fid = searchParams.get("fid");
    const twitter_userId = searchParams.get("twitter_userId");
    const includeWeights = searchParams.get("includeweights");
    const referrer = searchParams.get("referrer");
    if (!fid && !twitter) {
      return NextResponse.json({
        status: 400,
        error: "farcaster fid or Twitter handle is required",
      });
    }
    let user;
    user = await User.findOne({
      ...(twitter ? {twitter} : {}),
      ...(fid ? {farcaster: fid} : {}),
    });
    console.log(user);
    if (!user) {
      user = await User.create({
        ...(twitter ? {twitter} : {}),
        ...(fid ? {farcaster: fid} : {}),
        referrer,
      });
    }

    if (twitter) {
      if (!twitter_userId) {
        return NextResponse.json({
          status: 400,
          error: "Twitter User ID is required",
          message: "Twitter User ID is required",
        });
      }
    }
    let generatedValues: string[] | undefined = undefined;
    if (twitter && twitter_userId) {
      if (
        user.aiGeneratedValues.twitter &&
        user.aiGeneratedValues.twitter.length > 2
      ) {
        return NextResponse.json({
          status: 200,
          values: user.aiGeneratedValues.twitter,
          profileNft: `https://opensea.io/assets/base/0x55ea555d659cdef815a97e0a1fc026bffa71d094/${user.profileNft}`,
          message: "User already has generated values",
        });
      }

      const tweets = await fetchUserTweets(twitter_userId);
      if (tweets.length < 100) {
        return NextResponse.json({
          status: 403,
          error: "User has less than 100 tweets",
          message: "User has less than 100 tweets",
        });
      }
      generatedValues = await generateValuesForUser(tweets, true);

      if (generatedValues && Object.keys(generatedValues).length > 2) {
        user.aiGeneratedValuesWithWeights.twitter = generatedValues;
        const topValues = Object.keys(generatedValues).slice(0, 7);
        user.aiGeneratedValues.twitter = Array.from(topValues);
      }
    } else if (fid) {
      if (
        user.aiGeneratedValues.warpcast &&
        user.aiGeneratedValues.warpcast.length > 2
      ) {
        return NextResponse.json({
          status: 200,
          values: user.aiGeneratedValues.warpcast,
          profileNft: `https://opensea.io/assets/base/0x55ea555d659cdef815a97e0a1fc026bffa71d094/${user.profileNft}`,
          message: "User already has generated values",
        });
      }
      const casts = await fetchCastsForUser(fid, 200);
      if (casts.length < 100) {
        return NextResponse.json({
          status: 403,
          error: "User has less than 100 casts",
          message: "User has less than 100 casts",
        });
      }
      generatedValues = await generateValuesForUser(casts, true);
      if (generatedValues && Object.keys(generatedValues).length > 2) {
        user.aiGeneratedValuesWithWeights.warpcast = generatedValues;
        const topValues = Object.keys(generatedValues).slice(0, 7);
        user.aiGeneratedValues.warpcast = Array.from(topValues);
      }
    }

    await user.save();
    return NextResponse.json({
      status: 200,
      values: twitter
        ? user.aiGeneratedValues.twitter
        : user.aiGeneratedValues.warpcast,
      profileNft: `https://opensea.io/assets/base/0x55ea555d659cdef815a97e0a1fc026bffa71d094/${user.profileNft}`,
      message: "User generated values successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      error: error || "Internal Server Error",
      status: 500,
    });
  }
}
