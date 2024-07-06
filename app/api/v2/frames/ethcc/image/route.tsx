import {NextRequest} from "next/server";
import {ImageResponse} from "next/og";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const section = searchParams.get("section");
  const error = searchParams.get("error");
  let values: any | string[] = searchParams.get("values")?.split(",") ?? [];
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#fff",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",

          textAlign: "center",
          width: "100%",
        }}
      >
        {section && section === "1" && (
          <div
            style={{
              color: "#000",
              fontSize: 100,
              fontWeight: "bold",
              marginTop: 10,
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
            {!error && (
              <h3
                style={{
                  fontSize: 90,
                  marginTop: 20,
                  textAlign: "center",
                  whiteSpace: "pre-wrap",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center", // Center the content horizontally
                  backgroundColor: "yellow",
                  padding: "8px 16px",
                  borderRadius: 20,
                  fontWeight: "bold",
                  marginBottom: "0px",
                }}
              >
                Find 3 value aligned folks @ ETHCC
              </h3>
            )}

            {error && (
              <p
                style={{
                  fontSize: 90,
                  marginTop: 20,
                  textAlign: "center",
                  whiteSpace: "pre-wrap",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center", // Center the content horizontally
                  backgroundColor: "orange",
                  padding: "4px 16px",
                  borderRadius: 20,
                  fontWeight: "bold",
                  marginBottom: "0px",
                  color: "white",
                }}
              >
                {error.slice(1, -1)}
              </p>
            )}
          </div>
        )}

        {section && section === "2" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                color: "black",
                fontSize: 60,
                fontStyle: "normal",
                width: "90%",
                margin: "auto",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 120,
              }}
            >
              <p
                style={{
                  fontSize: 50,
                  color: "black",
                  fontStyle: "normal",
                  width: "90%",
                  margin: "auto",
                }}
              >
                ⏳ We will drop Values in your Wallet and inbox in a few mins.
              </p>
              <p
                style={{
                  backgroundColor: "yellow",
                  borderRadius: 60,
                  padding: "44px",
                  width: "90%",
                }}
              >
                Share this frame on your feed. The more people cast this frame,
                the more aligned folks we can find for you.
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
              width: "90%",
              margin: "auto",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                color: "#000",
                fontSize: 50,
                fontWeight: "bold",
                fontFamily: "sans-serif",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexDirection: "column",
                marginTop: 40,
              }}
            >
              I just minted my Values. Mint yours and find top 3 aligned folks @
              EthCC week
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 40,
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
                        fontSize: 60,
                        fontStyle: "normal",
                        borderRadius: 10,
                        border: "4px dashed yellow",
                        boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
                        padding: "0 16px",
                        fontWeight: "bold",
                        backgroundColor: "yellow",
                      }}
                    >
                      {value}
                    </p>
                  );
                })}
            </div>
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

export const dynamic = "force-dynamic";
