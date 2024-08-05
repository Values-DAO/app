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

    if (
      !targetUser &&
      targetUser.aiGeneratedValues.warpcast === undefined &&
      targetUser.aiGeneratedValues.warpcast.length === 0 &&
      targetUser.aiGeneratedValuesWithWeights &&
      targetUser.aiGeneratedValuesWithWeights.warpcast &&
      targetUser.aiGeneratedValues.twitter === undefined &&
      targetUser.aiGeneratedValues.twitter.length === 0 &&
      targetUser.aiGeneratedValuesWithWeights.twitter === undefined &&
      targetUser.aiGeneratedValuesWithWeights.twitter.length === 0
    ) {
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
    if (
      !user &&
      user.aiGeneratedValues.warpcast === undefined &&
      user.aiGeneratedValues.warpcast.length === 0 &&
      user.aiGeneratedValuesWithWeights.warpcast === undefined &&
      user.aiGeneratedValuesWithWeights.warpcast.length === 0 &&
      user.aiGeneratedValues.twitter === undefined &&
      user.aiGeneratedValues.twitter.length === 0 &&
      user.aiGeneratedValuesWithWeights.twitter === undefined &&
      user.aiGeneratedValuesWithWeights.twitter.length === 0
    ) {
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
      generatedValues:
        Object.keys(user?.aiGeneratedValuesWithWeights?.warpcast).length ===
          0 || user?.aiGeneratedValuesWithWeights?.warpcast === undefined
          ? {
              ...user?.aiGeneratedValues?.warpcast?.reduce(
                (acc: Record<string, number>, value: string) => {
                  acc[value] = 100;
                  return acc;
                },
                {}
              ),
              ...user?.aiGeneratedValues?.twitter?.reduce(
                (acc: Record<string, number>, value: string) => {
                  acc[value] = 100;
                  return acc;
                },
                {}
              ),
            }
          : {
              ...user?.aiGeneratedValuesWithWeights?.warpcast,
              ...user?.aiGeneratedValuesWithWeights?.twitter,
            },
    };

    targetUser = {
      generatedValues:
        Object.keys(targetUser?.aiGeneratedValuesWithWeights?.warpcast)
          .length === 0 ||
        targetUser?.aiGeneratedValuesWithWeights?.warpcast === undefined
          ? {
              ...targetUser?.aiGeneratedValues?.warpcast?.reduce(
                (acc: Record<string, number>, value: string) => {
                  acc[value] = 100;
                  return acc;
                },
                {}
              ),
              ...targetUser?.aiGeneratedValues?.twitter?.reduce(
                (acc: Record<string, number>, value: string) => {
                  acc[value] = 100;
                  return acc;
                },
                {}
              ),
            }
          : {
              ...targetUser?.aiGeneratedValuesWithWeights?.warpcast,
              ...targetUser?.aiGeneratedValuesWithWeights?.twitter,
            },
    };

    const userRecommendation = calculateAlignmentScore(
      user,
      [targetUser],
      true
    );
    if (userRecommendation.error) {
      console.error("Error:", userRecommendation.error);
      return NextResponse.json({
        status: 500,
        error: userRecommendation.error || "Internal server error",
      });
    }

    return NextResponse.json({
      status: 200,

      // targetToUserAlignment: userRecommendation[0].targetToUserScore,
      alignmentPercent:
        userRecommendation?.alignmentScores[0].userToTargetScore,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      status: 500,
      error: error || "Internal server error",
    });
  }
}
