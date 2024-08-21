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
import {Twitter, X} from "lucide-react";
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
import {Badge} from "@/components/ui/badge";

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
  const [loading, setLoading] = useState(false);
  const [loaderText, setLoaderText] = useState("Analyzing your values");
  const [error, setError] = useState<{
    platform: string;
    message: string;
  } | null>(null);
  const {address} = useAccount();
  const [onMintingSuccessful, setOnMintingSuccessful] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showNewFeatureModal, setShowNewFeatureModal] = useState(true);
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

  const analyse = async (
    socialMedia: "twitter" | "warpcast",
    method?: "refresh_values" | "generate_spectrum"
  ) => {
    if (!socialMedia) {
      setError({
        platform: socialMedia,
        message: "No account linked",
      });
      return;
    }
    setLoading(true);
    let result = null;
    if (socialMedia === "twitter" && user?.twitter?.username) {
      result = await analyseUserAndGenerateValues({
        twitter: user.twitter.username,
        ...(method ? {method} : {}),
      });
    } else if (socialMedia === "warpcast" && user?.farcaster?.fid) {
      result = await analyseUserAndGenerateValues({
        fid: user.farcaster.fid,
        ...(method ? {method} : {}),
      });
    }

    if (result?.error || !result?.user) {
      setError({
        platform: socialMedia,
        message: result?.error || "Error in generating values, try again later",
      });
      setLoading(false);
      return;
    }

    setUserInfo(result.user);

    setLoading(false);
  };

  return (
    <>
      {authenticated && (
        <div className="py-12 flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            {userInfo?.communitiesMinted?.includes("warpcast") &&
              !userInfo?.aiGeneratedValuesWithWeights?.warpcast &&
              userInfo?.communitiesMinted?.includes("twitter") &&
              !userInfo?.aiGeneratedValuesWithWeights?.twitter &&
              showNewFeatureModal && (
                <section className="fixed top-0 left-0 inset-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
                  <div className="relative bg-white p-8 py-12 rounded-lg shadow-lg w-[350px] h-[350px] flex flex-col justify-center">
                    <X
                      className="absolute top-4 right-4 cursor-pointer"
                      onClick={() => {
                        setShowNewFeatureModal(false);
                      }}
                    />
                    <div className="text-lg font-semibold">
                      Value Spectrums and Weighted Values.
                      <Badge className="ml-2 bg-green-300">New</Badge>
                    </div>
                    <div className="text-md font-light mt-2">
                      We have added few new features that allows you to generate
                      your Value Spectrums and Weighted Values. This will help
                      you understand your values better and connect with
                      communities that align with you.
                    </div>

                    <div className="text-md font-medium mt-4">
                      <p>
                        Go to AI Value Analysis to generate your Value Spectrum
                        and Weights for each social media platform.
                      </p>
                    </div>
                  </div>
                </section>
              )}

            {((userInfo &&
              userInfo.aiGeneratedValues?.warpcast &&
              userInfo.aiGeneratedValues?.warpcast.length > 0) ||
              (userInfo &&
                userInfo.aiGeneratedValues?.twitter &&
                userInfo.aiGeneratedValues?.twitter.length > 0)) &&
              (!userInfo.spectrums ||
                !userInfo.spectrums?.twitter ||
                !userInfo.spectrums?.warpcast ||
                userInfo.spectrums?.twitter.length === 0 ||
                userInfo.spectrums?.warpcast.length === 0) &&
              showNewFeatureModal && (
                <section className="fixed top-0 left-0 inset-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-50 z-40">
                  <div className="relative bg-white p-8 rounded-lg shadow-lg w-[350px] h-[350px] flex flex-col justify-center">
                    <X
                      className="absolute top-4 right-4 cursor-pointer"
                      onClick={() => {
                        setShowNewFeatureModal(false);
                      }}
                    />
                    <div className="text-lg font-semibold">
                      Value Spectrums
                      <Badge className="ml-2 bg-green-300">New</Badge>
                    </div>
                    <div className="text-md font-light mt-2">
                      We have added few new features that allow you to generate
                      your Value Spectrums. This will help you understand your
                      values better and connect with communities that align with
                      you.
                    </div>
                    <div className="text-md font-medium mt-4">
                      <p>
                        Go to AI Value Analysis to generate your Value Spectrum
                        for each social media platform.
                      </p>
                    </div>
                  </div>
                </section>
              )}

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
                      userInfo.aiGeneratedValues?.twitter?.map(
                        (value, index) => (
                          <ValueBadge key={index} value={value} />
                        )
                      )}
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
                          description: "Minted Values from Twitter",
                          wallets: userInfo?.wallets,
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
                {userInfo?.spectrums &&
                  userInfo?.spectrums?.twitter &&
                  userInfo?.spectrums?.twitter.length > 0 && (
                    <div className="flex flex-row gap-2 mt-6 items-center">
                      <p className="text-lg font-medium">
                        Your Value Spectrums are generated, check out in your
                        profile {"=>"}
                      </p>
                      <Button asChild>
                        <Link href={"/profile"}>Take me to Profile </Link>
                      </Button>
                    </div>
                  )}

                {userInfo?.communitiesMinted?.includes("twitter") &&
                  userInfo.aiGeneratedValuesWithWeights?.twitter &&
                  (!userInfo?.spectrums ||
                    userInfo?.spectrums?.twitter === undefined ||
                    (userInfo?.spectrums?.twitter?.length === 0 && (
                      <div className="flex flex-col gap-2 mt-6">
                        <div className="text-lg font-medium">
                          Generate your value spectrums
                          <Badge className="ml-2 bg-green-300">New</Badge>
                        </div>
                        {!loading && (
                          <Button
                            className="w-full cursor-pointer mt-4"
                            disabled={loader}
                            onClick={() => {
                              analyse("twitter", "generate_spectrum");
                            }}
                          >
                            Generate Value Spectrums
                          </Button>
                        )}
                      </div>
                    )))}

                {userInfo?.communitiesMinted?.includes("twitter") &&
                  !userInfo?.aiGeneratedValuesWithWeights?.twitter && (
                    <div className="flex flex-col gap-2 mt-6">
                      <div className="text-lg font-medium">
                        Your Profile hasn&apos;t generated weighted values yet,
                        proceed to generate them and also generate your Value
                        Spectrums
                        <Badge className="ml-2 bg-green-300">New</Badge>
                      </div>
                      {!loading && (
                        <Button
                          className="w-full cursor-pointer mt-4"
                          disabled={loader}
                          onClick={() => {
                            analyse("twitter", "refresh_values");
                          }}
                        >
                          Generate
                        </Button>
                      )}
                    </div>
                  )}
                {error && error.platform === "twitter" && (
                  <Alert
                    variant={"destructive"}
                    className=" my-2 bg-[#ff4747] text-white"
                  >
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}
                {!loading &&
                  userInfo?.aiGeneratedValues &&
                  userInfo?.aiGeneratedValues?.twitter?.length === 0 && (
                    <div className="flex flex-col gap-4">
                      <p className="leading-7 [&:not(:first-child)]:mt-6 text-center">
                        We are building an AI model that takes your content and
                        drills it down to Values. While this is not completely
                        accurate, the more data we get, the better we can train
                        the model.
                        <br></br> Think of this as a starting point to make your
                        values tangible. Not the final solution.
                        <br></br>You can mint these values to start with. They
                        are accurate enough to connect you to aligned people and
                        communities.
                        <br></br> Once you are done, mint your Community Values
                        and try minting manually too.
                      </p>

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

                {(!user?.twitter?.username ||
                  userInfo?.twitter === undefined) && (
                  <div className="flex flex-col gap-2 justify-center">
                    <p className="text-center font-semibold mt-2">
                      Connect your account to continue
                    </p>
                    <div className="flex flex-row gap-2 justify-center">
                      <Button
                        onClick={linkTwitter}
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
                      userInfo.aiGeneratedValues?.warpcast?.map(
                        (value, index) => (
                          <ValueBadge key={index} value={value} />
                        )
                      )}
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
                          description: "Minted Values from Warpcast",
                          wallets: userInfo?.wallets,
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

                {userInfo?.spectrums &&
                  userInfo?.spectrums?.warpcast &&
                  userInfo?.spectrums?.warpcast.length > 0 && (
                    <div className="flex flex-row gap-2 mt-6 items-center">
                      <p className="text-lg font-medium">
                        Your Value Spectrums are generated, check out in your
                        profile {"=>"}
                      </p>
                      <Button asChild>
                        <Link href={"/profile"}>Take me to Profile </Link>
                      </Button>
                    </div>
                  )}

                {userInfo?.communitiesMinted?.includes("warpcast") &&
                  userInfo.aiGeneratedValuesWithWeights?.warpcast &&
                  (!userInfo?.spectrums ||
                    userInfo?.spectrums?.warpcast === undefined ||
                    (userInfo?.spectrums?.warpcast?.length === 0 && (
                      <div className="flex flex-col gap-2 mt-6">
                        <div className="text-lg font-medium">
                          Generate your value spectrums
                          <Badge className="ml-2 bg-green-300">New</Badge>
                        </div>
                        {!loading && (
                          <Button
                            className="w-full cursor-pointer mt-4"
                            disabled={loader}
                            onClick={() => {
                              analyse("warpcast", "generate_spectrum");
                            }}
                          >
                            Generate Value Spectrums
                          </Button>
                        )}
                      </div>
                    )))}

                {userInfo?.communitiesMinted?.includes("warpcast") &&
                  !userInfo?.aiGeneratedValuesWithWeights?.warpcast && (
                    <div className="flex flex-col gap-2 mt-6">
                      <div className="text-lg font-medium">
                        Your Profile hasn&apos;t generated weighted values yet,
                        proceed to generate them and also generate your Value
                        Spectrums
                        <Badge className="ml-2 bg-green-300">New</Badge>
                      </div>
                      {!loading && (
                        <Button
                          className="w-full cursor-pointer mt-4"
                          disabled={loader}
                          onClick={() => {
                            analyse("warpcast", "refresh_values");
                          }}
                        >
                          Generate
                        </Button>
                      )}
                    </div>
                  )}
                {error && error.platform === "warpcast" && (
                  <Alert
                    variant={"destructive"}
                    className=" my-2 bg-[#ff4747] text-white"
                  >
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}
                {userInfo?.aiGeneratedValues &&
                  userInfo?.aiGeneratedValues?.warpcast?.length === 0 && (
                    <div className="flex flex-col gap-4">
                      <p className="leading-7 [&:not(:first-child)]:mt-6 text-center">
                        We are building an AI model that takes your content and
                        drills it down to Values. While this is not completely
                        accurate, the more data we get, the better we can train
                        the model.
                        <br></br> Think of this as a starting point to make your
                        values tangible. Not the final solution.
                        <br></br>You can mint these values to start with. They
                        are accurate enough to connect you to aligned people and
                        communities.
                        <br></br> Once you are done, mint your Community Values
                        and try minting manually too.
                      </p>

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

                {!user?.farcaster?.fid && (
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
              <h2 className="scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight first:mt-0 max-w-5xl text-muted-foreground text-center">
                {loaderText}
              </h2>
            </div>
          )}
          {onMintingSuccessful && (
            <AlertDialog open={onMintingSuccessful}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Value Minted Successfully.{" "}
                  </AlertDialogTitle>
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
