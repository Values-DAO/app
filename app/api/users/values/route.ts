import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user";
import axios from "axios";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const fid = searchParams.get("fid");

  if (!fid) {
    return NextResponse.json({error: "fid is required"});
  }

  try {
    await connectToDatabase();
    const user = await Users.findOne({
      fid: fid,
    });
    if (!user) {
      axios.post(`${process.env.NEXT_PUBLIC_HOST}/api/pregenerator`, {
        fid,
        referrer: "app.valuesdao.io",
      });
      return NextResponse.json({error: "User not found"});
    }
    const userValues = Array.from(
      new Set([
        ...(user.generatedValues.warpcast || []),
        ...(user.generatedValues.twitter || []),
      ])
    );

    if (userValues.length === 0) {
      axios.post(`${process.env.NEXT_PUBLIC_HOST}/api/pregenerator`, {
        fid,
        referrer: "app.valuesdao.io",
      });
      return NextResponse.json({error: "User has no generated values"});
    }

    return NextResponse.json({fid: fid, values: userValues.slice(0, 3)});
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "An error occurred"}, {status: 500});
  }
}
