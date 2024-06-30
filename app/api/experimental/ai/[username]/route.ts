import User from "@/models/user";
import {NextRequest, NextResponse} from "next/server";

import connectToDatabase from "@/lib/connect-to-db";
import {fetchCastsForUser} from "@/lib/fetch-user-casts";

import {fetchUserTweets} from "@/lib/fetch-user-tweets";
import {GetFIDForUsername} from "@/lib/get-username-fid";
import {generateValuesForUserExp} from "@/lib/experimental/generate-user-values-per-casts";

export async function GET(req: NextRequest, params: any) {
  try {
    await connectToDatabase();

    const username = params.params.username;

    if (!username) {
      return NextResponse.json({
        status: 400,
        error: "farcaster fid or Twitter handle is required",
      });
    }

    let fid = await GetFIDForUsername(username as string);

    let generatedValues: any | undefined = undefined;
    if (fid) {
      const casts = await fetchCastsForUser(fid, 200);
      if (casts.length < 100) {
        return NextResponse.json({
          status: 400,
          error: "User has less than 100 casts",
        });
      }
      generatedValues = await generateValuesForUserExp(casts);
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
