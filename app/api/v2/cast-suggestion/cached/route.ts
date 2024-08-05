import Wildcard from "@/models/wildcard";
import {NextResponse} from "next/server";

export async function GET(req: any) {
  const searchParams = req.nextUrl.searchParams;
  const fid = searchParams.get("fid");

  if (!fid) {
    return NextResponse.json({
      status: 400,
      error: "fid is required",
    });
  }

  try {
    const response = await Wildcard.findOne(
      {fid: fid},
      {
        _id: 0,
        suggestions: 1,
      }
    );

    if (!response) {
      return NextResponse.json({
        status: 404,
        error: "Not cached, pls call /api/v2/cast-suggestion first",
      });
    }

    return NextResponse.json(response?.suggestions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      error,
    });
  }
}
