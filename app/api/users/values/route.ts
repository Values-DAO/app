import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user";
import axios from "axios";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const fid = searchParams.get("fid");
  const email = searchParams.get("email");

  if (!userId && !fid && !email) {
    return NextResponse.json(
      {error: "userId, fid or email is required"},
      {status: 400}
    );
  }

  try {
    await connectToDatabase();
    const user = await Users.findOne({
      ...(userId && {userId}),
      ...(fid && {fid}),
      ...(email && {email}),
    });
    if (!user) {
      return NextResponse.json({error: "User not found"}, {status: 404});
    }
    const topValues = user?.generatedValues?.warpcast.slice(0, 3) ?? [];

    if (topValues.length === 0) {
      axios.post(`${process.env.NEXT_PUBLIC_HOST}/api/pregenerator`, {
        fid,
        referrer: "app.valuesdao.io",
      });
      return NextResponse.json(
        {error: "User has no generated values"},
        {status: 404}
      );
    }

    return NextResponse.json(
      topValues,

      {status: 200}
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "An error occurred"}, {status: 500});
  }
}
