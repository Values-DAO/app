import calculateAlignmentScore from "@/lib/calculate-alignment-score";
import connectToDatabase from "@/lib/connect-to-database";
import logger from "@/lib/logger";
import Users from "@/models/user";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const fid = searchParams.get("fid");
  const target = searchParams
    .get("target")
    ?.split(",")
    ?.filter((t) => t.trim() !== "" && !isNaN(Number(t)))
    ?.map((t) => t.trim());

  if (!fid || !target || target.length === 0) {
    logger.warn("Invalid input");
    return NextResponse.json(
      {
        error: "Invalid input: 'fid' and valid target FIDs must be provided.",
      },
      {status: 400}
    );
  }

  try {
    await connectToDatabase();
    const [user, ...targetUsers] = await Promise.all([
      Users.findOne({fid}),
      ...target.map((targetFid) => Users.findOne({fid: targetFid})),
    ]);

    if (!user) {
      logger.warn("User not found");
      return NextResponse.json({error: "User not found."}, {status: 404});
    }

    const scores = targetUsers.map((targetUser, index) => {
      const targetFid = target[index];

      if (!targetUser) {
        logger.warn(`Target user ${targetFid} not found`);
        return {
          fid: targetFid,
          score: 0,
          error: "Target user not found",
        };
      }

      const hasUserSpectrum =
        user?.spectrum?.warpcast?.length > 0 ||
        user?.spectrum?.twitter?.length > 0;
      const hasTargetSpectrum =
        targetUser?.spectrum?.warpcast?.length > 0 ||
        targetUser?.spectrum?.twitter?.length > 0;

      if (!hasUserSpectrum || !hasTargetSpectrum) {
        logger.warn(`Missing spectrum data for ${targetFid}`);
        return {
          fid: targetFid,
          score: 0,
          error: "Missing spectrum data",
        };
      }

      return {
        fid: targetFid,
        score: calculateAlignmentScore(user, targetUser),
      };
    });

    return NextResponse.json({user: fid, scores}, {status: 200});
  } catch (error) {
    logger.error("Error calculating alignment score", error as any);
    return NextResponse.json(
      {error: "An error occurred while processing the request."},
      {status: 500}
    );
  }
}
