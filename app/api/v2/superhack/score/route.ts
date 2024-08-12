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
    const [userData, targetData] = await Promise.all([
      axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/v2/superhack/generate-user-value?fid=${userFID}&includeweights=true`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY,
          },
        }
      ),
      axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/v2/superhack/generate-user-value?fid=${targetFID}&includeweights=true`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY,
          },
        }
      ),
    ]);

    if (userData.data.status === 403) {
      return NextResponse.json({
        status: 403,
        error: `User with FID ${userFID} has less than 100 casts`,
      });
    }

    if (targetData.data.status === 403) {
      return NextResponse.json({
        status: 403,
        error: `User with FID ${targetFID} has less than 100 casts`,
      });
    }

    let user = userData.data;

    let targetUser = targetData.data;
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
      alignmentPercent:
        userRecommendation?.alignmentScores[0].targetToUserScore,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      status: 500,
      error: error || "Internal server error",
    });
  }
}
