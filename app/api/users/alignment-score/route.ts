import calculateAlignmentScore from "@/lib/calculate-alignment-score";
import connectToDatabase from "@/lib/connect-to-database";
import logger from "@/lib/logger";
import Users from "@/models/user";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const fid = searchParams.get("fid");
  const targetFid = searchParams.get("targetFid");
  if (!fid || !targetFid) {
    logger.warn("Invalid input");
    return NextResponse.json(
      {
        error: "Invalid input: 'fid' and 'targetFid' must be provided.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    await connectToDatabase();
    const user = await Users.findOne({fid});
    const targetUser = await Users.findOne({fid: targetFid});

    if (!user || !targetUser) {
      logger.warn("User or target user not found");
      return NextResponse.json(
        {
          error: "User or target user not found.",
        },
        {
          status: 404,
        }
      );
    }
    if (
      user?.spectrum?.warpcast?.length == 0 ||
      targetUser?.spectrum?.warpcast?.length == 0
    ) {
      logger.warn("User or target user has no warpcast spectrum");
      return NextResponse.json(
        {
          error: "User or target user has no warpcast spectrum.",
        },
        {
          status: 400,
        }
      );
    }
    const alignmentScore = calculateAlignmentScore(user, targetUser);

    return NextResponse.json(
      {
        alignmentScore,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    logger.error("Error calculating alignment score", error as any);
    return NextResponse.json(
      {
        error: "An error occurred while processing the request.",
      },
      {
        status: 500,
      }
    );
  }
}
