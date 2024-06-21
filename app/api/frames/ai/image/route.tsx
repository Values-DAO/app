import {NextRequest} from "next/server";
import {ImageResponse} from "next/og";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const section = searchParams.get("section");
  let values: any | string[] = searchParams.get("values")?.split(",") ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#fff",
          // backgroundImage: 'url("https://valuesdao-frames.vercel.app/bg.png")',
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",

          textAlign: "center",
          width: "100%",
        }}
      >
        <img
          src={`${process.env.NEXT_PUBLIC_HOST}/logo.png`}
          style={{
            width: "260px",
            height: "160px",
          }}
        />

        {section && section === "1" && (
          <div
            style={{
              color: "#000",
              fontSize: 100,
              fontWeight: "bold",
              marginTop: 10,

              whiteSpace: "pre-wrap",
              display: "flex",
              flexDirection: "column",
            }}
          >
            Analyse your values?
          </div>
        )}

        {section && section === "2" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",

              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                color: "black",
                fontSize: 60,
                fontStyle: "normal",

                padding: "0 120px",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <p
                style={{
                  backgroundColor: "yellow",
                  borderRadius: 60,
                  padding: "44px",
                }}
              >
                We are analysing your values, sit back and we will direct cast
                you your values in few mins.
              </p>
            </div>
          </div>
        )}

        {section && section === "3" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",

              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                color: "#000",
                fontSize: 70,
                fontWeight: "bold",

                whiteSpace: "pre-wrap",
                display: "flex",
                flexDirection: "column",
              }}
            >
              || ai generated values
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 30,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {values &&
                values.map((value: any) => {
                  return (
                    <p
                      key={value}
                      style={{
                        color: "black",
                        fontSize: 50,
                        fontStyle: "normal",
                        borderRadius: 10,
                        backgroundColor: "yellow",
                        padding: "0 16px",
                        fontWeight: "bold",
                      }}
                    >
                      {value}
                    </p>
                  );
                })}
            </div>
          </div>
        )}
        {section && section === "4" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",

              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                color: "black",
                fontSize: 60,
                fontStyle: "normal",

                padding: "0 120px",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexDirection: "column",
              }}
            >
              We successfully minted your value NFTs in Base Sepolia.
            </div>
            <p
              style={{
                color: "black",
                fontSize: 30,
                fontStyle: "normal",
                letterSpacing: "-0.025em",
                lineHeight: 1.4,
                marginTop: 80,
                padding: "0 120px",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "yellow",
                borderRadius: 10,
              }}
            >
              We minted your Value NFTs to your wallet.
            </p>
          </div>
        )}
      </div>
    ),
    {
      width: 1528, // Match these dimensions to your image's dimensions
      height: 800,
    }
  );
}
