"use client";
import {Button} from "@/components/ui/button";
import {usePrivy} from "@privy-io/react-auth";
import React, {useState, useEffect} from "react";

import {useUserContext} from "@/providers/user-context-provider";

import {useAccount, useWriteContract} from "wagmi";
import {TabsContent} from "@radix-ui/react-tabs";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Alert, AlertDescription} from "@/components/ui/alert";

import useValuesHook from "../hooks/useValuesHook";
import axios from "axios";
import ValueBadge from "@/components/ui/value-badge";
import {Twitter} from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import Image from "next/image";
import {toast} from "@/components/ui/use-toast";
import NextAuth from "next-auth";
import next from "next";
import {useSession} from "next-auth/react";

const ValuePage = () => {
  const {
    user,
    authenticated,
    ready,
    login,
    linkTwitter,
    linkFarcaster,
    linkWallet,
  } = usePrivy();
  const {analyseUserAndGenerateValues, mintHandler} = useValuesHook();

  const {userInfo, setUserInfo} = useUserContext();
  const {data: nextauth} = useSession();
  const [loading, setLoading] = useState(false);
  const [loaderText, setLoaderText] = useState("Analyzing your values");
  const [error, setError] = useState<{
    platform: string;
    message: string;
  } | null>(null);
  const {address} = useAccount();
  const [onMintingSuccessful, setOnMintingSuccessful] = useState(false);
  const [loader, setLoader] = useState(false);
  const loaderTexts: string[] = [
    "Analyzing your social content...",
    "Extracting values from your interactions...",
    "Gleaning insights from your digital footprint...",
    "Mapping your social values...",
    "Interpreting the essence of your online presence...",
  ];
  // useEffect(() => {
  //   const fetchValueRecs = async () => {
  //     const response = await axios.get("/api/v2/value/", {
  //       headers: {
  //         "Content-Type": "application/json",
  //         "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
  //       },
  //     });
  //     setValueRecommendation(response.data.values);
  //   };

  //   fetchValueRecs();
  // }, []);

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
    let result = null; // Use a result object to hold the function's output

    if (socialMedia === "twitter" && user?.twitter?.username) {
      result = await analyseUserAndGenerateValues({
        twitter: user.twitter.username,
      });
    } else if (socialMedia === "warpcast" && user?.farcaster?.fid) {
      result = await analyseUserAndGenerateValues({
        fid: user.farcaster.fid,
      });
    } else {
      setError({
        platform: socialMedia,
        message: "No account linked",
      });
      setLoading(false);
      return;
    }

    if (
      result?.values &&
      (result.values.twitter.length > 0 || result.values.warpcast.length > 0)
    ) {
      setUserInfo({...userInfo, aiGeneratedValues: result.values});
    } else {
      setError({
        platform:
          socialMedia === "twitter"
            ? "INSUFFICIENT_TWEETS"
            : "INSUFFICIENT_CASTS",
        message:
          "This account has less than 100 casts/tweets. We need more data to generate values.",
      });
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  return (
    <div className="py-12 flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <Tabs defaultValue={"twitter"} className="w-full">
          <TabsList className="flex justify-center py-2 text-black">
            <TabsTrigger
              value="twitter"
              className="text-md text-wrap md:text-lg  w-[50%] md:py-[1px] "
            >
              Twitter
            </TabsTrigger>
            <TabsTrigger
              value="warpcast"
              className="text-md text-wrap md:text-lg w-[50%] md:py-[1px]"
            >
              Warpcast
            </TabsTrigger>{" "}
          </TabsList>

          <TabsContent value="twitter">
            {userInfo?.aiGeneratedValues?.twitter &&
              userInfo?.aiGeneratedValues?.twitter?.length > 0 &&
              userInfo?.aiGeneratedValues?.twitter.every((str) =>
                userInfo?.mintedValues?.some(
                  (mintedValue) =>
                    mintedValue.value.toLowerCase() === str.toLowerCase()
                )
              ) && (
                <Alert className="bg-green-300 my-2 text-black">
                  <AlertDescription>
                    You have already minted these value NFTs.
                  </AlertDescription>
                </Alert>
              )}
            {
              <div className="flex flex-row flex-wrap gap-2 font-medium mt-4">
                {userInfo &&
                  userInfo.aiGeneratedValues?.twitter?.map((value, index) => (
                    <ValueBadge key={index} value={value} />
                  ))}
              </div>
            }
            {!userInfo?.communitiesMinted?.includes("twitter") &&
              userInfo?.aiGeneratedValues?.twitter &&
              userInfo?.aiGeneratedValues?.twitter?.length > 0 && (
                <Button
                  variant={"default"}
                  className="w-full cursor-pointer mt-4"
                  onClick={async () => {
                    setLoader(true);
                    const response = await mintHandler({
                      values: userInfo?.aiGeneratedValues?.twitter?.map(
                        (value) => ({
                          name: value,
                          weightage: "1",
                        })
                      )!,
                      type: "community",
                      communityId: "twitter",
                    });
                    setLoader(false);

                    if (response) {
                      setUserInfo(response.user);
                      setOnMintingSuccessful(true);
                    } else if (!response) {
                      toast({
                        title: "Minting Failed.",
                        description: "Please try again later",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={loader}
                >
                  {loader ? "Minting..." : "Mint Values"}
                </Button>
              )}

            {!address &&
              userInfo?.wallets?.length === 0 &&
              userInfo?.aiGeneratedValues &&
              userInfo?.aiGeneratedValues?.twitter?.length > 0 && (
                <Button
                  variant={"default"}
                  className="w-full cursor-pointer mt-4"
                  onClick={linkWallet}
                  disabled={loader}
                >
                  Connect Wallet to mint
                </Button>
              )}

            {!loading &&
              userInfo?.aiGeneratedValues &&
              userInfo?.aiGeneratedValues?.twitter?.length === 0 && (
                <div className="flex flex-col gap-4">
                  <p className="leading-7 [&:not(:first-child)]:mt-6 text-center">
                    We are building an AI model that takes your content and
                    drills it down to Values. While this is not completely
                    accurate, the more data we get, the better we can train the
                    model.
                    <br></br> Think of this as a starting point to make your
                    values tangible. Not the final solution.
                    <br></br>You can mint these values to start with. They are
                    accurate enough to connect you to aligned people and
                    communities.
                    <br></br> Once you are done, mint your Community Values and
                    try minting manually too.
                  </p>

                  {error && error.platform === "INSUFFICIENT_TWEETS" && (
                    <Alert
                      variant={"destructive"}
                      className=" my-2 bg-[#ff4747] text-white"
                    >
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}

                  {userInfo && userInfo?.twitter && !loading && (
                    <Button
                      className="w-full cursor-pointer mt-4"
                      disabled={loader}
                      onClick={() => {
                        analyse("twitter");
                      }}
                    >
                      Analyse my values
                    </Button>
                  )}
                </div>
              )}

            {(!user?.twitter?.username || userInfo?.twitter === undefined) && (
              <div className="flex flex-col gap-2 justify-center">
                <p className="text-center font-semibold mt-2">
                  Connect your account to continue
                </p>
                <div className="flex flex-row gap-2 justify-center">
                  <Button
                    onClick={() => {
                      if (nextauth?.user) {
                        login();
                      } else {
                        linkTwitter();
                      }
                    }}
                    className="w-full cursor-pointer mt-4"
                  >
                    Link Twitter
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="warpcast">
            {userInfo?.aiGeneratedValues?.warpcast &&
              userInfo?.aiGeneratedValues?.warpcast?.length > 0 &&
              userInfo?.aiGeneratedValues?.warpcast.every((str) =>
                userInfo?.mintedValues?.some(
                  (mintedValue) =>
                    mintedValue.value.toLowerCase() === str.toLowerCase()
                )
              ) && (
                <Alert className="bg-green-300 my-2 text-black">
                  <AlertDescription>
                    You have already minted these value NFTs.
                  </AlertDescription>
                </Alert>
              )}
            {
              <div className="flex flex-row flex-wrap gap-2 font-medium mt-4">
                {userInfo &&
                  userInfo.aiGeneratedValues?.warpcast?.map((value, index) => (
                    <ValueBadge key={index} value={value} />
                  ))}
              </div>
            }
            {!userInfo?.communitiesMinted?.includes("warpcast") &&
              userInfo?.aiGeneratedValues?.warpcast &&
              userInfo.aiGeneratedValues.warpcast.length > 0 && (
                <Button
                  variant={"default"}
                  className="w-full cursor-pointer mt-4"
                  onClick={async () => {
                    setLoader(true);
                    const response = await mintHandler({
                      values: userInfo?.aiGeneratedValues?.warpcast?.map(
                        (value) => ({
                          name: value,
                          weightage: "1",
                        })
                      )!,
                      type: "community",
                      communityId: "warpcast",
                    });
                    setLoader(false);
                    if (response) {
                      setUserInfo(response.user);
                      setOnMintingSuccessful(true);
                    } else if (!response) {
                      toast({
                        title: "Minting Failed.",
                        description: "Please try again later",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={loader}
                >
                  {loader ? "Minting..." : "Mint Values"}
                </Button>
              )}

            {userInfo?.aiGeneratedValues &&
              userInfo?.aiGeneratedValues?.warpcast?.length === 0 && (
                <div className="flex flex-col gap-4">
                  <p className="leading-7 [&:not(:first-child)]:mt-6 text-center">
                    We are building an AI model that takes your content and
                    drills it down to Values. While this is not completely
                    accurate, the more data we get, the better we can train the
                    model.
                    <br></br> Think of this as a starting point to make your
                    values tangible. Not the final solution.
                    <br></br>You can mint these values to start with. They are
                    accurate enough to connect you to aligned people and
                    communities.
                    <br></br> Once you are done, mint your Community Values and
                    try minting manually too.
                  </p>
                  {error && error.platform === "INSUFFICIENT_CASTS" && (
                    <Alert
                      variant={"destructive"}
                      className=" my-2 bg-[#ff4747] text-white"
                    >
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}

                  {userInfo && userInfo.farcaster && !loading && (
                    <Button
                      className="w-full cursor-pointer mt-4"
                      disabled={loader}
                      onClick={() => {
                        analyse("warpcast");
                      }}
                    >
                      Analyse my values
                    </Button>
                  )}
                </div>
              )}

            {!user?.farcaster?.fid && !userInfo?.farcaster && (
              <div className="flex flex-col gap-2 justify-center">
                <p className="text-center font-semibold mt-2">
                  Connect your account to continue
                </p>
                <div className="flex flex-row gap-2 justify-center">
                  <Button
                    onClick={linkFarcaster}
                    className="w-full cursor-pointer mt-4"
                  >
                    Link Warpcast
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {loading && (
        <div className="flex flex-col gap-4 justify-center">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 max-w-5xl text-muted-foreground">
            {loaderText}
          </h2>
        </div>
      )}
      {onMintingSuccessful && (
        <AlertDialog open={onMintingSuccessful}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Value Minted Successfully. </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setOnMintingSuccessful(false);
                }}
              >
                Close
              </AlertDialogCancel>
              <div className="flex flex-row gap-2">
                <Link
                  href="https://warpcast.com/~/compose?text=I%20just%20minted%20my%20values%20on%20ValuesDAO.%20Check%20if%20you%27re%20aligned%20with%20me%2C%20anon%3F%20&embeds[]=https://app.valuesdao.io"
                  target="_blank"
                >
                  <Button className="flex flex-row w-full">
                    Share
                    <Image
                      src="/white-purple.png"
                      width={20}
                      height={20}
                      alt="farcaster"
                      className="mx-2"
                    />
                  </Button>
                </Link>
                <Link
                  href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fapp.valuesdao.io%2F&text=I%20just%20minted%20my%20values%20on%20ValuesDAO.%20Check%20if%20you%27re%20aligned%20with%20me%2C%20anon%3F"
                  target="_blank"
                >
                  <Button className="flex flex-row w-full">
                    Tweet
                    <Twitter
                      strokeWidth={0}
                      fill="#1DA1F2"
                      className="h-6 w-6 ml-2"
                    />
                  </Button>
                </Link>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default ValuePage;
