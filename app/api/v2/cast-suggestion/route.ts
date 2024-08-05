import {getFarcasterUserFollowers} from "@/lib/get-farcaster-user-followers";
import {getLatestsCasts} from "@/lib/get-latest-casts";
import {sortByAlignmentFids} from "@/lib/sort-by-aligment-fids";
import Wildcard from "@/models/wildcard";
import {NextResponse} from "next/server";

export async function GET(req: any) {
  const searchParams = req.nextUrl.searchParams;
  const fid = searchParams.get("fid");
  try {
    const followers = await getFarcasterUserFollowers({fid});

    const response = await sortByAlignmentFids({
      fids: followers,
      userFID: fid,
    });

    const suggestedCasts = await Promise.all(
      response.map(async (suggestion: {fid: number; score: number}) => {
        return {
          fid: suggestion.fid,
          score: suggestion.score,
          recentCasts: await getLatestsCasts(suggestion.fid),
        };
      })
    );
    let wildcardResponse = await Wildcard.findOneAndUpdate(
      {fid},
      {$set: {suggestions: suggestedCasts}},
      {new: true, upsert: true}
    );
    console.log("wildcardResponse", wildcardResponse);
    return NextResponse.json(suggestedCasts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      error,
    });
  }
}
