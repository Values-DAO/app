import axios from "axios";
import {NextRequest, NextResponse} from "next/server";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      fid: string;
    };
  }
) {
  const {
    untrustedData: {fid},
  } = await req.json();
  if (!fid) {
    return NextResponse.json({status: 400, message: "Missing fid"});
  }

  const {data} = await axios.get(
    `${process.env.NEXT_PUBLIC_HOST}/api/v2/one-one-score/?userFid=${params.fid}&targetFid=${fid}`
  );

  let imageUrl;
  if (data.error) {
    imageUrl = `${process.env.NEXT_PUBLIC_HOST}/api/v2/superhack/image?section=2&error=true`;
  } else
    imageUrl = `${process.env.NEXT_PUBLIC_HOST}/api/v2/superhack/image?section=2&score=${data.alignmentPercent}&user=${fid}&target=${params.fid}`;
  return new NextResponse(
    `<!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="ValuesDAO" />
          <meta property="og:image" content="${imageUrl}" />
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${imageUrl}" />
   ${
     data.error
       ? `  <meta name="fc:frame:button:1" content="Take me to ValuesDAO" />
          <meta name="fc:frame:button:1:action" content="link" />
          <meta name="fc:frame:button:1:target" content=${`https://app.valuesdao.io/`} />`
       : `<meta name="fc:frame:button:1" content="cast it" />
          <meta name="fc:frame:button:1:action" content="link" />
          <meta name="fc:frame:button:1:target" content="${`https://warpcast.com/~/compose?text=&embeds[]=${process.env.NEXT_PUBLIC_HOST}/api/v2/superhack/${fid}`}" />
          <meta name="fc:frame:button:2" content="My Values" />
          <meta name="fc:frame:button:2:action" content="link" />
          <meta name="fc:frame:button:2:target" content="${`https://app.valuesdao.io/u/${fid}`}" />`
   }
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
