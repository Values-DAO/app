import calculateAlignmentScore from "@/lib/calculate-alingment-score";
import connectToDatabase from "@/lib/connect-to-db";
import User from "@/models/user";
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

    if (!targetUser || !user) {
      return NextResponse.json({
        status: 404,
        error: "User not found",
      });
    }

    user = {
      ...user,
      generatedValues: user.aiGeneratedValuesWithWeights.warpcast,
    };
    targetUser = {
      ...targetUser,
      generatedValues: targetUser.aiGeneratedValuesWithWeights.warpcast,
    };
    const userRecommendation = calculateAlignmentScore(
      user,
      [targetUser],
      true
    );

    return NextResponse.json({
      status: 200,

      targetToUserAlignment: userRecommendation[0].targetToUserScore,
      userToTargetAlignment: userRecommendation[0].userToTargetScore,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      status: 500,
      error: error || "Internal server error",
    });
  }
}
