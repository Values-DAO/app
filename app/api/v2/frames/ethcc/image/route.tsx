import {NextRequest} from "next/server";
import {ImageResponse} from "next/og";
import {
  TbCircleNumber1Filled,
  TbCircleNumber2Filled,
  TbCircleNumber3Filled,
  TbCircleNumber4Filled,
} from "react-icons/tb";

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
        <img
          src={`${process.env.NEXT_PUBLIC_HOST}/logo.png`}
          style={{
            height: "60px",
            marginTop: 20,
          }}
        />

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

              alignItems: "center", // Center the content horizontally
            }}
          >
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
                padding: "0 16px",
                borderRadius: 10,
                fontWeight: "bold",
                marginBottom: "0px",
              }}
            >
              {" "}
              Are you going to ETHCC?
            </h3>
            <p
              style={{
                fontSize: 40,
                width: "95%",
                fontWeight: "medium",
                margin: "0",
                textAlign: "center",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexDirection: "column",
                marginTop: "5px",
                alignItems: "center", // Center the content horizontally
              }}
            >
              and want to find your top 3 folks who match your vibes?
            </p>
            {error && (
              <p
                style={{
                  fontSize: 70,
                  width: "95%",
                  fontWeight: "medium",
                  margin: "0",
                  textAlign: "center",
                  whiteSpace: "pre-wrap",
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 80,
                  alignItems: "center", // Center the content horizontally
                  backgroundColor: "orange",
                  padding: "0 16px",
                  color: "white",
                }}
              >
                {error.slice(1, -1)}
              </p>
            )}

            {!error && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",

                  width: "93%",
                  margin: "auto",
                  marginTop: 80,
                  gap: 20,
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "180px",
                    border: "2px dashed yellow",
                    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
                    width: "48%", // Ensure equal width for children
                    padding: "20px",
                  }}
                >
                  <span
                    style={{
                      color: "black",
                      fontSize: 25,
                      background: "yellow",
                      padding: "2px 16px",
                      fontWeight: "bold",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Step <TbCircleNumber1Filled />: Analyse your values
                  </span>
                  <p
                    style={{
                      color: "black",
                      fontSize: 20,
                      fontStyle: "lite",
                      fontWeight: "bold",
                      padding: "0 20px",
                      textAlign: "center",
                      marginTop: "20px",
                      marginBottom: "0px",
                    }}
                  >
                    We fetch casts and analyse it using our AI model to generate
                    your first principle values.
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "180px",
                    border: "2px dashed yellow",
                    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
                    width: "48%", // Ensure equal width for children
                    padding: "20px",
                  }}
                >
                  <span
                    style={{
                      color: "black",
                      fontSize: 25,
                      background: "yellow",
                      padding: "2px 16px",
                      fontWeight: "bold",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Step <TbCircleNumber2Filled />: Follow @ValuesDAO
                  </span>
                  <p
                    style={{
                      color: "black",
                      fontSize: 20,
                      fontStyle: "lite",
                      fontWeight: "bold",
                      padding: "0 20px",
                      textAlign: "center",
                      marginTop: "20px",
                      marginBottom: "0px",
                    }}
                  >
                    Follow @ValuesDAO to get your generated values in your
                    direct cast in few minutes.
                  </p>
                </div>
              </div>
            )}

            {!error && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",

                  width: "93%",
                  margin: "auto",
                  marginTop: 20,
                  gap: 20,
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "180px",
                    border: "2px dashed yellow",
                    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
                    width: "48%", // Ensure equal width for children
                    padding: "20px",
                  }}
                >
                  <span
                    style={{
                      color: "black",
                      fontSize: 25,
                      background: "yellow",
                      padding: "2px 16px",
                      fontWeight: "bold",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Step <TbCircleNumber3Filled />: Cast this frame
                  </span>
                  <p
                    style={{
                      color: "black",
                      fontSize: 20,
                      fontStyle: "lite",
                      fontWeight: "bold",
                      padding: "0 20px",
                      textAlign: "center",
                      marginTop: "20px",
                      marginBottom: "0px",
                    }}
                  >
                    Share this frame so we can find you more aligned folks that
                    are gonna be attending ETHCC week.
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "180px",
                    border: "2px dashed yellow",
                    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
                    width: "48%", // Ensure equal width for children
                    padding: "20px",
                  }}
                >
                  <span
                    style={{
                      color: "black",
                      fontSize: 25,
                      background: "yellow",
                      padding: "2px 16px",
                      fontWeight: "bold",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Step <TbCircleNumber4Filled />: Get top 3 aligned folks in
                    your direct cast
                  </span>
                  <p
                    style={{
                      color: "black",
                      fontSize: 20,
                      fontStyle: "lite",
                      fontWeight: "bold",
                      padding: "0 20px",
                      textAlign: "center",
                      marginTop: "20px",
                      marginBottom: "0px",
                    }}
                  >
                    On 10th July, we will direct cast you with top 3 aligned
                    folks that are gonna be attending ETHCC week whom you
                    definitely meet!
                  </p>
                </div>
              </div>
            )}
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
                width: "90%",
                margin: "auto",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <p
                style={{
                  fontSize: 50,
                  color: "black",
                  fontStyle: "normal",
                  width: "90%",
                  margin: "40px auto",
                }}
              >
                We are analysing your casts, sit back and we will direct cast
                you your values in few mins.
              </p>
              <p
                style={{
                  backgroundColor: "yellow",
                  borderRadius: 60,
                  padding: "44px",
                  width: "90%",
                  margin: "40px auto",
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
              I just minted my values at ValuesDAO, Mint your values and find
              your top 3 aligned folks whom you should meet during ethcc week.
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

export const dynamic = "force-dynamic";
