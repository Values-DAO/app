/** @jsxImportSource frog/jsx */
import {Button, Frog, TextInput} from "frog";
import {handle} from "frog/next";
import {devtools} from "frog/dev";
import {serveStatic} from "frog/serve-static";
import axios from "axios";
import "../../globals.css";
const app = new Frog({
  basePath: "/frames",
  title: "Frog Frame",
});

app.frame("/", async (c) => {
  const {buttonValue, frameData} = c;

  if (buttonValue === "mint") {
    const mintValues = async () => {
      const {data} = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/users?fid=${frameData?.fid}`
      );

      console.log(data);
      console.log(c);
      if (data.error) {
        return c.res({
          image: (
            <div
              style={{
                backgroundColor: "#efefef",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                height: "100vh",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: 70,

                  fontWeight: 800,
                  textAlign: "center",
                  marginTop: 70,
                  color: "#facc15",
                }}
              >
                You don't have enough casts.
              </p>
              <p
                style={{
                  fontSize: 40,
                  color: "black",
                  fontWeight: 400,
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                Visit ValuesDAO app to generate with your twitter account.
              </p>
            </div>
          ),
          intents: [
            <Button.Link href="https://app.valuesdao.io">Show me</Button.Link>,
          ],
        });
      }

      const {generatedValues, socialValuesMinted, profileNft, profileMinted} =
        data;
      if (
        profileMinted ||
        (socialValuesMinted && socialValuesMinted.includes("warpcast"))
      ) {
        return c.res({
          image: (
            <div
              style={{
                backgroundColor: "#efefef",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                height: "100vh",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: 70,

                  fontWeight: 800,
                  textAlign: "center",
                  marginTop: 70,
                  color: "#facc15",
                }}
              >
                You have already minted your Values.
              </p>
              <p
                style={{
                  fontSize: 40,
                  color: "black",
                  fontWeight: 400,
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                Visit ValuesDAO app to checkout your Value Spectrums.
              </p>
            </div>
          ),
          intents: (
            <Button.Link
              href={`${process.env.NEXT_PUBLIC_HOST}/u/${frameData?.fid}`}
            >
              Take me
            </Button.Link>
          ),
        });
      }

      if (
        generatedValues &&
        generatedValues.warpcast &&
        generatedValues.warpcast.length === 0
      ) {
        return c.res({
          image: (
            <div
              style={{
                backgroundColor: "#efefef",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                height: "100vh",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: 70,

                  fontWeight: 800,
                  textAlign: "center",
                  marginTop: 70,
                  color: "#facc15",
                }}
              >
                You don't have enough casts.
              </p>
              <p
                style={{
                  fontSize: 40,
                  color: "black",
                  fontWeight: 400,
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                Visit ValuesDAO app to generate with your twitter account.
              </p>
            </div>
          ),
          intents: (
            <Button.Link href={`${process.env.NEXT_PUBLIC_HOST}`}>
              Take me
            </Button.Link>
          ),
        });
      }
      if (
        generatedValues &&
        generatedValues.warpcast &&
        generatedValues.warpcast.length > 0
      ) {
        // const mintResponse = await axios.post(
        //   `${process.env.NEXT_PUBLIC_HOST}/api/users`
        // );

        return c.res({
          image: (
            <div
              style={{
                backgroundColor: "#efefef",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                height: "100vh",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: 70,

                  fontWeight: 800,
                  textAlign: "center",
                  marginTop: 70,
                  color: "#facc15",
                }}
              >
                Values successfully minted on Base.
              </p>
              <p
                style={{
                  fontSize: 40,
                  color: "black",
                  fontWeight: 400,
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                Visit ValuesDAO app to view your Value Spectrums.
              </p>
            </div>
          ),
          intents: (
            <Button.Link
              href={`${process.env.NEXT_PUBLIC_HOST}/u/${frameData?.fid}`}
            >
              Take me
            </Button.Link>
          ),
        });
      }
    };
    const res = await mintValues();
    return res as any;
  }
  return c.res({
    image: (
      <div
        style={{
          backgroundColor: "#efefef",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          alignItems: "center",
        }}
      >
        <p
          style={{
            fontSize: 100,
            color: "#facc15",
            fontWeight: 800,
            textAlign: "center",
            marginTop: 70,
          }}
        >
          Mint my Values
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            border: "1.5px solid #d1d7d7",
            width: "80%",
            margin: "auto",
            borderRadius: 10,
            boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
            padding: 40,
          }}
        >
          <p
            style={{
              fontSize: 40,
              color: "black",
              fontWeight: "bold",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            Individualism vs Collectivism
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 20,
                justifyContent: "space-between",
                width: "100%",
                fontSize: 30,
                fontWeight: 400,
                color: "#888b8b",
              }}
            >
              <p>Individualist</p>
              <p>Collectivist</p>
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                borderRadius: 10,
                border: "2.5px solid #d1d7d7",
                boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
                marginBottom: 20,
                height: 40,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  height: "100%",
                  width: 20,
                  backgroundColor: "#facc15",
                  borderRadius: "5",

                  position: "absolute",
                  top: 0,
                  left: "40%",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    intents: [<Button value="mint">Mint</Button>],
  });
});

devtools(app, {appFid: 252720, serveStatic});
export const GET = handle(app);
export const POST = handle(app);
