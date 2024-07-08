import calculateAlignmentScore from "@/lib/calculate-alingment-score";
import connectToDatabase from "@/lib/connect-to-db";
import {fetchCastsForUser} from "@/lib/fetch-user-casts";
import {generateValuesForUser} from "@/lib/generate-user-values-per-casts";
import ETHCCFCAttendee from "@/models/ethccfarcaster";
import User from "@/models/user";
import {NextResponse} from "next/server";

export async function GET(req: any) {
  const searchParams = req.nextUrl.searchParams;
  const target = searchParams.get("targetFid");

  if (!target) {
    return NextResponse.json({
      status: 400,
      error: "target is required",
    });
  }
  const casts = await fetchCastsForUser(target, 200);
  const user = {
    fid: target,
    generatedValues: await generateValuesForUser(casts, true),
  };
  try {
    await connectToDatabase();
    const allUsers = await ETHCCFCAttendee.find({});

    const userRecommendation = calculateAlignmentScore(user, allUsers);
    // console.log("User recommendation", userRecommendation);
    return NextResponse.json({
      status: 200,
      targetUser: {
        fid: user.fid,
        generatedValues: user.generatedValues,
      },
      alignedFolks: userRecommendation,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      status: 500,
      error: "Internal server error",
    });
  }
}
