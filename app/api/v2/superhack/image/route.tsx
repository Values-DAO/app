import {NextRequest} from "next/server";
import {ImageResponse} from "next/og";
import {join} from "path";
import * as fs from "fs";
import Image from "next/image";
import {getFarcasterUserImage} from "@/lib/get-farcaster-user-image";
import {MoveDownLeft} from "lucide-react";
import User from "@/models/user";
import axios from "axios";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const section = searchParams.get("section");
  let error;
  const fontPath = join(process.cwd(), "public/PixeloidSans-mLxMm.ttf");
  const user = searchParams.get("user");
  const target = searchParams.get("target");
  let font = fs.readFileSync(fontPath);
  let userImage = "";
  let targetImage = "";
  let alignmentScore: number | undefined = undefined;
  if (user && target) {
    const [userData, targetData, alignmentScoreResponse] = await Promise.all([
      getFarcasterUserImage(user),
      getFarcasterUserImage(target),

      axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/v2/superhack/score/?userFid=${user}&targetFid=${target}`
      ),
    ]);
    if (alignmentScoreResponse.data.error) {
      error = true;
    }
    alignmentScore = alignmentScoreResponse.data.alignmentPercent;

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
        }}
      >
        {!error && section && section === "1" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 80,
            }}
          >
            <div
              style={{
                color: "#000",
                fontSize: 164,
                fontWeight: "bold",
                marginTop: 60,
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
              Are we aligned, anon?
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

        {!error && section && section === "2" && (
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
                Number(alignmentScore) < 30
                  ? "red"
                  : Number(alignmentScore) <= 70
                  ? "yellow"
                  : "lightgreen"
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
              <p
                style={{
                  fontSize: 120,
                  color: "#000",
                }}
              >
                {" "}
                {alignmentScore}% Aligned
              </p>
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
              {Number(alignmentScore) < 30
                ? "Huh, nah nah nah, we ain't aligned"
                : "Aye, we be aligned"}
            </p>
            <div
              style={{
                marginBottom: 60,
                display: "flex",
                flexDirection: "row",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  height: 100,
                  position: "relative",
                  width: 45,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    width: 24,
                    height: 24,
                    transform: "rotate(-45deg)",
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                  }}
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 19l-7-7 7-7"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    width: 24,
                    height: 24,
                    transform: "rotate(-45deg)",
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                  }}
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 19l-7-7 7-7"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    width: 24,
                    height: 24,
                    transform: "rotate(-45deg)",
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                  }}
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 19l-7-7 7-7"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    width: 24,
                    height: 24,
                    transform: "rotate(-45deg)",
                    position: "absolute",
                    bottom: -10,
                    left: -10,
                  }}
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 19l-7-7 7-7"
                  />
                </svg>
              </div>
              <p
                style={{
                  marginBottom: 60,
                  fontSize: 40,
                  color: "#fff",
                }}
              >
                Let your followers check their value-alignment with you
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              color: "#eef616",
              marginBottom: 60,
              fontSize: 80,
              textAlign: "center",
              whiteSpace: "pre-wrap",
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              margin: "auto",
              justifyContent: "center",
              alignItems: "center", // Center the content horizontally
              backgroundImage: `linear-gradient(to top, red, #ff000072)`, // Linear gradient from bottom to transparent based on score
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "70%",
              }}
            >
              <p>You don&apos;t have enough casts to find alignment score.</p>{" "}
              <p>
                {" "}
                Visit ValuesDAO app and generate values using your twitter.
              </p>
            </div>
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
