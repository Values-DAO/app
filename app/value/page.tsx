"use client";
import {Button} from "@/components/ui/button";
import {usePrivy} from "@privy-io/react-auth";
import React, {useState, useEffect} from "react";
import useValues from "../hooks/useValues";
import {useUserContext} from "@/providers/user-context-provider";
import {Badge} from "@/components/ui/badge";

const ValuePage = () => {
  const {user, authenticated, ready, login, linkTwitter, linkFarcaster} =
    usePrivy();
  const {analyseUserAndGenerateValues, updateUser} = useValues();
  const {userInfo, setUserInfo, isLoading} = useUserContext();
  const [loading, setLoading] = useState(false);
  const [loaderText, setLoaderText] = useState("Analyzing your values");
  const [error, setError] = useState<{
    platform: string;
    message: string;
  } | null>(null);

  const loaderTexts: string[] = [
    "Analyzing your social content...",
    "Extracting values from your interactions...",
    "Gleaning insights from your digital footprint...",
    "Mapping your social values...",
    "Interpreting the essence of your online presence...",
  ];

  useEffect(() => {
    if (loading) {
      const intervalId = setInterval(() => {
        setLoaderText((prevText) => {
          const currentIndex = loaderTexts.indexOf(prevText);
          const nextIndex = (currentIndex + 1) % loaderTexts.length;
          return loaderTexts[nextIndex];
        });
      }, 2000); // Change text every 2 seconds

      return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }
  }, [loading]);

  const analyse = async (socialMedia: string) => {
    setLoading(true);
    let values;

    if (socialMedia === "twitter" && user?.twitter?.username) {
      ({values} = await analyseUserAndGenerateValues({
        twitter: user.twitter.username,
      }));
    } else if (socialMedia === "warpcast" && user?.farcaster?.fid) {
      ({values} = await analyseUserAndGenerateValues({
        fid: user.farcaster.fid,
      }));
    } else {
      setError({
        platform: socialMedia,
        message: "No account linked",
      });
      setLoading(false);
      return;
    }

    setUserInfo({...userInfo, generatedValues: values});
    setLoading(false);
  };
  useEffect(() => {
    const addTwitterHandle = async () => {
      console.log(user);
      if (user?.twitter?.username) {
        await updateUser({twitter: user.twitter.username});
        setUserInfo({...userInfo, twitter: user.twitter.username});
      }
    };
    addTwitterHandle();
  }, [user]);
  return (
    <>
      {authenticated && (
        <div className="p-4 flex flex-col flex-grow min-h-[80vh] gap-4">
          {!isLoading &&
            userInfo?.generatedValues &&
            userInfo.generatedValues.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="scroll-m-20 text-center border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 max-w-5xl text-muted-foreground">
                  Your values
                </h2>{" "}
                <div className="grid grid-cols-2 gap-4 md:flex md:flex-row md:gap-4 font-medium">
                  {userInfo.generatedValues.map((value, index) => (
                    <Badge key={index} className="rounded-sm text-[18px] ">
                      {value}
                    </Badge>
                  ))}{" "}
                </div>
              </div>
            )}

          {!loading &&
            !isLoading &&
            userInfo?.generatedValues?.length === 0 && (
              <div className="flex flex-col gap-4 items-center justify-center">
                <h2 className="scroll-m-20 border-b pb-2 text-md tracking-tight first:mt-0 max-w-5xl text-center">
                  We are building an AI model that takes your content and drills
                  it down to Values. While this is not completely accurate, the
                  more data we get, the better we can train the model.<br></br>
                  <br></br> Think of this as a starting point to make your
                  values tangible. Not the final solution. <br></br>
                  <br></br>You can mint these values to start with. They are
                  accurate enough to connect you to aligned people and
                  communities.<br></br>
                  <br></br> Once you are done, mint your Community Values and
                  try minting manually too.
                </h2>

                {error ? (
                  <div className="flex flex-col gap-2 justify-center">
                    <p>Connect your account to continue</p>
                    <div className="flex flex-row gap-2 justify-center">
                      {!user?.twitter?.username &&
                        error.platform === "twitter" && (
                          <Button onClick={linkTwitter}>Link Twitter</Button>
                        )}
                      {!user?.farcaster?.fid &&
                        error.platform === "warpcast" && (
                          <Button onClick={linkFarcaster}>Link Warpcast</Button>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 justify-center">
                    <p>Analyse using my data from</p>
                    <div className="flex flex-row gap-2 justify-center">
                      <Button
                        onClick={() => {
                          analyse("twitter");
                        }}
                      >
                        Twitter
                      </Button>{" "}
                      <Button
                        onClick={() => {
                          analyse("warpcast");
                        }}
                      >
                        Warpcast
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

          {loading && (
            <div className="flex flex-col gap-4 justify-center">
              <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 max-w-5xl text-muted-foreground">
                {loaderText}
              </h2>
            </div>
          )}
        </div>
      )}
      {!authenticated && (
        <section className="w-full mt-24 md:mt-[15%]  flex flex-col items-center ">
          <span className="font-semibold  text-gray-300 text-lg">
            Login to view
          </span>
          <Button
            variant="default"
            onClick={login}
            disabled={!ready || authenticated}
            className="my-4"
          >
            Login
          </Button>
        </section>
      )}
    </>
  );
};

export default ValuePage;
