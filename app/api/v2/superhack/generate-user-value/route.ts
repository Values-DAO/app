import {NextRequest, NextResponse} from "next/server";

import {fetchCastsForUser} from "@/lib/fetch-user-casts";
import {generateValuesForUser} from "@/lib/generate-user-values-per-casts";
import axios from "axios";
import connectToDatabase from "@/lib/connect-to-db";
import User from "@/models/user";

export async function GET(req: any) {
  try {
    await connectToDatabase();
    const searchParams = new URL(req.nextUrl).searchParams;

    const fid = searchParams.get("fid");
    const includeWeights = searchParams.get("includeweights");

    if (!fid) {
      return NextResponse.json({
        status: 400,
        error: "farcaster fid or Twitter handle is required",
      });
    }

    const user = await User.findOneAndUpdate(
      {farcaster: fid},
      {$setOnInsert: {farcaster: fid}},
      {upsert: true, new: true}
    );

    if (
      user &&
      user.aiGeneratedValuesWithWeights &&
      user.aiGeneratedValuesWithWeights.warpcast &&
      Object.keys(user.aiGeneratedValuesWithWeights.warpcast).length > 0
    ) {
      return NextResponse.json({
        status: 200,
        generatedValues: user.aiGeneratedValuesWithWeights.warpcast,
      });
    } else if (
      user &&
      user.aiGeneratedValues &&
      user.aiGeneratedValues.warpcast &&
      user.aiGeneratedValues.warpcast.length > 0
    ) {
      return NextResponse.json({
        status: 200,
        generatedValues: {
          ...user?.aiGeneratedValues?.warpcast?.reduce(
            (acc: Record<string, number>, value: string) => {
              acc[value] = 100;
              return acc;
            },
            {}
          ),
        },
      });
    }

    let generatedValues: string[] | undefined = undefined;

    if (fid) {
      console.log("Generating values for user");

      const casts = await fetchCastsForUser(fid, 100);

      if (casts.length < 100) {
        return NextResponse.json({
          status: 403,
          error: "User has less than 100 casts",
        });
      }
      generatedValues = await generateValuesForUser(
        casts,
        includeWeights === "true"
      );
      if (generatedValues && Object.keys(generatedValues).length > 2) {
        user.aiGeneratedValuesWithWeights.warpcast = generatedValues;
        const topValues = Object.keys(generatedValues).slice(0, 7);
        user.aiGeneratedValues.warpcast = Array.from(topValues);
        await user.save();
      }
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
// ... existing code ...

export const dynamic = "force-dynamic";
