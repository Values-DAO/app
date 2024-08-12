import User from "@/models/user";
import {NextRequest, NextResponse} from "next/server";
import {headers} from "next/headers";
import validateApiKey from "@/lib/validate-key";
import connectToDatabase from "@/lib/connect-to-db";
import {fetchCastsForUser} from "@/lib/fetch-user-casts";
import {generateValuesForUser} from "@/lib/generate-user-values-per-casts";
import {fetchUserTweets} from "@/lib/fetch-user-tweets";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const searchParams = req.nextUrl.searchParams;

    const fid = searchParams.get("fid");
    const includeWeights = searchParams.get("includeweights");

    if (!fid) {
      return NextResponse.json({
        status: 400,
        error: "farcaster fid or Twitter handle is required",
      });
    }

    let generatedValues: string[] | undefined = undefined;
    if (fid) {
      const startTime = Date.now();

      const casts = await fetchCastsForUser(fid, 100);

      if (casts.length < 100) {
        return NextResponse.json({
          status: 403,
          error: "User has less than 100 casts",
        });
      }
      console.log(`Time taken before ai: ${Date.now() - startTime}ms`);
      generatedValues = await generateValuesForUser(
        casts,
        includeWeights === "true"
      );
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      console.log(`Time taken by fetchCastsForUser: ${elapsedTime}ms`);
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
