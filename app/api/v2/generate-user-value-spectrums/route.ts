import User from "@/models/user";
import {NextRequest, NextResponse} from "next/server";
import {headers} from "next/headers";
import validateApiKey from "@/lib/validate-key";
import connectToDatabase from "@/lib/connect-to-db";
import {fetchCastsForUser} from "@/lib/fetch-user-casts";
import {generateValuesWithSpectrumForUser} from "@/lib/generate-user-values-per-casts";
import {fetchUserTweets} from "@/lib/fetch-user-tweets";
import axios from "axios";

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
    const referrer = searchParams.get("referrer");
    let method = searchParams.get("method");

    if (!fid && !twitter) {
      return NextResponse.json({
        status: 400,
        error: "farcaster fid or Twitter handle is required",
      });
    }
    let user;
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
        referrer,
      });
    }
    if (!method && user.createdAt > new Date("2024-08-21")) {
      method = "new_user";
    }
    let generatedValues: any | undefined = undefined;
    let userContent: any | undefined = undefined;
    if (twitter && twitter_userId) {
      userContent = await fetchUserTweets(twitter_userId);
      if (userContent.error) {
        return NextResponse.json({
          status: 500,
          error: userContent.error || "Internal Server Error",
        });
      }
      if (userContent.length < 100) {
        return NextResponse.json({
          status: 403,
          error: "User has less than 100 tweets",
        });
      }
    } else if (fid) {
      userContent = await fetchCastsForUser(fid, 100);
      if (userContent.length < 100) {
        return NextResponse.json({
          status: 403,
          error: "User has less than 100 casts",
        });
      }
    }

    if (twitter && twitter_userId) {
      generatedValues = await generateValuesWithSpectrumForUser(userContent);
      if (generatedValues && generatedValues.error) {
        return NextResponse.json({
          status: 500,
          error: generatedValues.error || "Internal Server Error",
        });
      }
      if (method === "refresh_values") {
        user.aiGeneratedValues.twitter.forEach((value: string) => {
          const mintedValue = user.mintedValues.find(
            (mv: any) => mv.value.toLowerCase() === value.toLowerCase()
          );

          if (mintedValue) {
            const newWeight = mintedValue.weightage - 1;
            if (newWeight > 0) {
              mintedValue.weightage = newWeight;
            }

            if (newWeight === 0) {
              user.mintedValues = user.mintedValues.filter(
                (mv: any) => mv.value.toLowerCase() !== value.toLowerCase()
              );
            }
          }
        });

        user.aiGeneratedValuesWithWeights.twitter = generatedValues.userValues;
        user.aiGeneratedValues.twitter = generatedValues.topValues;
        user.spectrums.twitter = generatedValues.userSpectrum;
        await user.save();
        const {data} = await axios.post(
          `${process.env.NEXT_PUBLIC_HOST}/api/v2/user`,
          {
            farcaster: user.farcaster,
            method: "update_profile",
            values: generatedValues.topValues.map((value: string) => ({
              name: value,
              weightage: "1",
            })),
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
            },
          }
        );

        if (data.error) {
          return NextResponse.json({
            status: 500,
            error: data.error || "Internal Server Error",
          });
        }
        return NextResponse.json({
          status: 200,
          user: data.user,
        });
      } else if (method === "new_user") {
        user.aiGeneratedValuesWithWeights.twitter = generatedValues.userValues;
        user.aiGeneratedValues.twitter = generatedValues.topValues;
        user.spectrums.twitter = generatedValues.userSpectrum;
      } else if (method === "generate_spectrum") {
        user.spectrums.twitter = generatedValues.userSpectrum;
      }
    } else if (fid) {
      generatedValues = await generateValuesWithSpectrumForUser(userContent);
      if (generatedValues && generatedValues.error) {
        return NextResponse.json({
          status: 500,
          error: generatedValues.error || "Internal Server Error",
        });
      }
      if (method === "refresh_values") {
        user.aiGeneratedValues.warpcast.forEach((value: string) => {
          const mintedValue = user.mintedValues.find(
            (mv: any) => mv.value.toLowerCase() === value.toLowerCase()
          );

          if (mintedValue) {
            const newWeight = mintedValue.weightage - 1;
            if (newWeight > 0) {
              mintedValue.weightage = newWeight;
            }

            if (newWeight === 0) {
              user.mintedValues = user.mintedValues.filter(
                (mv: any) => mv.value.toLowerCase() !== value.toLowerCase()
              );
            }
          }
        });

        user.aiGeneratedValuesWithWeights.warpcast = generatedValues.userValues;
        user.aiGeneratedValues.warpcast = generatedValues.topValues;
        user.spectrums.warpcast = generatedValues.userSpectrum;
        await user.save();
        const {data} = await axios.post(
          `${process.env.NEXT_PUBLIC_HOST}/api/v2/user`,
          {
            farcaster: user.farcaster,
            method: "update_profile",
            values: generatedValues.topValues.map((value: string) => ({
              name: value,
              weightage: "1",
            })),
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
            },
          }
        );

        if (data.error) {
          return NextResponse.json({
            status: 500,
            error: data.error || "Internal Server Error",
          });
        }
        return NextResponse.json({
          status: 200,
          user: data.user,
        });
      } else if (method === "new_user") {
        user.aiGeneratedValuesWithWeights.warpcast = generatedValues.userValues;
        user.aiGeneratedValues.warpcast = generatedValues.topValues;
        user.spectrums.warpcast = generatedValues.userSpectrum;
      } else if (method === "generate_spectrum") {
        user.spectrums.warpcast = generatedValues.userSpectrum;
      }
    }

    await user.save();
    return NextResponse.json({
      status: 200,
      user,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Internal Server Error. Please try again later.",
      status: 500,
    });
  }
}
