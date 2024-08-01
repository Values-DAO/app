import calculateAlignmentScore from "@/lib/calculate-alingment-score";
import connectToDatabase from "@/lib/connect-to-db";
import User from "@/models/user";
import axios from "axios";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const targetFID = searchParams.get("targetFid");
  const userFID = searchParams.get("userFid");

  if (!targetFID || !userFID) {
    return NextResponse.json({
      status: 400,
      error: "target is required",
    });
  }

  try {
    await connectToDatabase();
    let targetUser = await User.findOne({farcaster: targetFID});
    let user = await User.findOne({farcaster: userFID});

    if (!targetUser) {
      const {data} = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/v2/generate-user-value?fid=${targetFID}&includeweights=true`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY,
          },
        }
      );
      targetUser = data.user;
    }
    if (!user) {
      const {data} = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/v2/generate-user-value?fid=${userFID}&includeweights=true`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY,
          },
        }
      );
      user = data.user;
    }

    user = {
      ...user,
      generatedValues:
        user?.aiGeneratedValuesWithWeights?.warpcast ??
        user.aiGeneratedValues?.warpcast?.map((value: string) => {
          return {[value]: 100};
        }),
    };

    targetUser = {
      ...targetUser,
      generatedValues:
        targetUser?.aiGeneratedValuesWithWeights?.warpcast ??
        targetUser?.aiGeneratedValues?.warpcast?.map((value: string) => {
          return {[value]: 100};
        }),
    };

    const userRecommendation = calculateAlignmentScore(
      user,
      [targetUser],
      true
    );

    return NextResponse.json({
      status: 200,

      // targetToUserAlignment: userRecommendation[0].targetToUserScore,
      alignmentPercent: userRecommendation[0].userToTargetScore,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      status: 500,
      error: error || "Internal server error",
    });
  }
}
