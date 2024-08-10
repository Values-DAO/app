import {NextRequest} from "next/server";
import {ImageResponse} from "next/og";
import {join} from "path";
import * as fs from "fs";
import Image from "next/image";
import {getFarcasterUserImage} from "@/lib/get-farcaster-user-image";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const section = searchParams.get("section");
  const image = searchParams.get("image");
  const fontPath = join(process.cwd(), "public/PixeloidSans-mLxMm.ttf");
  const user = searchParams.get("user");
  const target = searchParams.get("target");
  let font = fs.readFileSync(fontPath);
  let userImage = "";
  let targetImage = "";
  if (user && target) {
    const [userData, targetData] = await Promise.all([
      getFarcasterUserImage(user),
      getFarcasterUserImage(target),
    ]);

    userImage = userData;
    targetImage = targetData;
  }

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          height: "100vh",
          textAlign: "center",
          width: "100vw",
          backgroundImage: `url(${process.env.NEXT_PUBLIC_HOST}/bg.jpg)`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "100% 100%", // Stretches the image to cover the whole area
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {section && section === "1" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                color: "#000",
                fontSize: 140,
                fontWeight: "bold",
                marginTop: 2,
                textAlign: "center",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexDirection: "column",
                width: "90%",
                margin: "auto",
                justifyContent: "center",
                alignItems: "center", // Center the content horizontally
              }}
            >
              Are ye aligned with me, anon?
            </div>

            {/* {image && (
              <img
                src={image}
                alt="logo"
                width={220}
                height={220}
                style={{
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            )} */}
          </div>
        )}

        {section && section === "2" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `linear-gradient(to top, ${
                Number(searchParams.get("score")) < 20 ? "red" : "lightgreen"
              }, transparent)`, // Linear gradient from bottom to transparent based on score
            }}
          >
            <div
              style={{
                color: "#000",
                fontSize: 160,
                fontWeight: "bold",
                marginTop: 2,
                textAlign: "center",
                whiteSpace: "pre-wrap",
                display: "flex",
                gap: 20,
                flexDirection: "row",
                width: "90%",
                margin: "auto",
                justifyContent: "center",
                alignItems: "center", // Center the content horizontally
              }}
            >
              <img
                src={userImage}
                alt=""
                style={{
                  width: 200,
                  height: 200,
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
              <p> {searchParams.get("score")}%</p>
              <img
                src={targetImage}
                alt=""
                style={{
                  width: 200,
                  height: 200,
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            </div>
            <p
              style={{
                marginBottom: 60,
                fontSize: 80,
                color: "#fff",
              }}
            >
              {Number(searchParams.get("score")) < 20
                ? "Huh, nah nah nah, we ain't aligned"
                : "Aye, we be aligned"}
            </p>
          </div>
        )}
      </div>
    ),
    {
      width: 1528, // Match these dimensions to your image's dimensions
      height: 800,
      fonts: [
        {name: "PixeloidSans-mLxMm", data: font, weight: 400, style: "normal"},
      ],
    }
  );
}

export const dynamic = "force-dynamic";
