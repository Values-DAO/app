import axios from "axios";
import {NextRequest, NextResponse} from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      fid: string;
    };
  }
) {
  const imageUrl = `${process.env.NEXT_PUBLIC_HOST}/api/v2/superhack/image?section=1`;
  const postUrl = `${process.env.NEXT_PUBLIC_HOST}/api/v2/superhack/${params.fid}/align`;

  return new NextResponse(
    `<!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="ValuesDAO" />
          <meta property="og:image" content="${imageUrl}" />
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${imageUrl}" />
          <meta name="fc:frame:post_url" content="${postUrl}" />
          <meta name="fc:frame:button:1" content="Oke, show" />,
                
          <meta name="fc:frame:button:2" content="wat d fk iz dis?" />
          <meta name="fc:frame:button:2:action" content="link" />
          <meta name="fc:frame:button:2:target" content="https://valuesdao.io/making-values-tangible/" />
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
