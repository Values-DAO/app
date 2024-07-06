import connectToDatabase from "@/lib/connect-to-db";
import User from "@/models/user";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const fid = searchParams.get("fid");
  console.log("fid", fid);

  await connectToDatabase();
  const userInfo = await User.findOne({farcaster: fid});

  if (!userInfo) {
    return NextResponse.json({
      status: 404,
      error: "User not found",
    });
  }

  const imageUrl = `${
    process.env.NEXT_PUBLIC_HOST
  }/api/v2/frames/ethcc/image?section=3&values=${userInfo.aiGeneratedValues.warpcast.join(
    ","
  )}`;
  const postUrl = `${process.env.NEXT_PUBLIC_HOST}/api/v2/frames/ethcc/`;
  return new NextResponse(
    `<!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="ValuesDAO" />
          <meta property="og:image" content="${imageUrl}" />
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${imageUrl}" />
          <meta name="fc:frame:post_url" content="${postUrl}" />
          <meta name="fc:frame:button:1" content="Find my values" />,
        </head>
        <body></body>
      </html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}
