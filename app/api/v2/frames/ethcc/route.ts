import {getFarcasterUserFollowers} from "@/lib/get-farcaster-user-followers";
import axios from "axios";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  const imageUrl = `${process.env.NEXT_PUBLIC_HOST}/api/v2/frames/ethcc/image?section=1`;
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
          <meta name="fc:frame:button:1" content="Analyse my values" />,
                
          <meta name="fc:frame:button:2" content="More about ValuesDAO" />
          <meta name="fc:frame:button:2:action" content="link" />
          <meta name="fc:frame:button:2:target" content="https://docs.google.com/document/d/1rNvqD6PxvFHRavaP-I-7_Oq6xqFPSVf_CqqXLWe3ze0/edit" />
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
  const imageUrl = `${process.env.NEXT_PUBLIC_HOST}/api/v2/frames/ethcc/image?section=2`;
  const {
    untrustedData: {fid},
  } = await req.json();
  const postUrl = `${process.env.NEXT_PUBLIC_HOST}/api/v2/frames/ethcc/`;

  try {
    const followers = await getFarcasterUserFollowers("valuesdao");

    if (!followers.includes(Number(fid))) {
      return new NextResponse(
        `<!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="ValuesDAO" />
          <meta property="og:image" content="${process.env.NEXT_PUBLIC_HOST}/api/v2/frames/ethcc/image?section=1&error=%22Please%20Follow%20@ValuesDAO%20to%20continue.%22" />
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${process.env.NEXT_PUBLIC_HOST}/api/v2/frames/ethcc/image?section=1&error=%22Please%20Follow%20@ValuesDAO%20to%20continue.%22" />
          <meta name="fc:frame:post_url" content="${postUrl}" />
        <meta name="fc:frame:image" content="${imageUrl}" />
          <meta name="fc:frame:post_url" content="${postUrl}" />
          <meta name="fc:frame:button:1" content="Analyse my values" />,
                
          <meta name="fc:frame:button:2" content="More about ValuesDAO" />
          <meta name="fc:frame:button:2:action" content="link" />
          <meta name="fc:frame:button:2:target" content="https://docs.google.com/document/d/1rNvqD6PxvFHRavaP-I-7_Oq6xqFPSVf_CqqXLWe3ze0/edit" />
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
    axios.post(`${process.env.NEXT_PUBLIC_HOST}/api/v2/frames/ethcc/handler`, {
      fid,
    });
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
         
      
          <meta name="fc:frame:button:1" content="Click to cast" />
          <meta name="fc:frame:button:1:action" content="link" />
          <meta name="fc:frame:button:1:target" content="https://warpcast.com/~/compose?text=I%20just%20minted%20my%20values%20at%20ValuesDAO,%20if%20you%20are%20coming%20to%20ETHCC,%20mint%20your%20values%20and%20find%20your%20aligned%20folks%20&embeds[]=${process.env.NEXT_PUBLIC_HOST}/api/v2/frames/ethcc" />
      

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
