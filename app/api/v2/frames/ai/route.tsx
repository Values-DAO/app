import axios from "axios";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  const imageUrl = `${process.env.NEXT_PUBLIC_HOST}/api/v2/frames/ai/image?section=1`;
  const postUrl = `${process.env.NEXT_PUBLIC_HOST}/api/v2/frames/ai/`;
  return new NextResponse(
    `<!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="ValuesDAO" />
          <meta property="og:image" content="${imageUrl}" />
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${imageUrl}" />
          <meta name="fc:frame:post_url" content="${postUrl}" />
          <meta name="fc:frame:button:1" content="Analyse" />,
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
export async function POST(req: NextRequest) {
  const imageUrl = `${process.env.NEXT_PUBLIC_HOST}/api/v2/frames/ai/image?section=2`;
  const {
    untrustedData: {fid},
  } = await req.json();
  try {
    axios.post(
      `${process.env.NEXT_PUBLIC_HOST}/api/v2/frames/ai/value-generator-handler`,
      {
        fid,
      }
    );
    console.log("Generated values for user", fid);
  } catch (error) {
    console.error("Error generating user value", error);
  }
  return new NextResponse(
    `<!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="ValuesDAO" />
          <meta property="og:image" content="${imageUrl}" />
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${imageUrl}" />
         
          <meta name="fc:frame:button:1" content="Visit ValuesDAO" />
          <meta name="fc:frame:button:1:action" content="link" />
          <meta name="fc:frame:button:1:target" content="https://app.valuesdao.io" />

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
