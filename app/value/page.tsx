"use client";
import {Button} from "@/components/ui/button";
import {usePrivy} from "@privy-io/react-auth";
import React, {useState, useEffect} from "react";
import useValues from "../hooks/useValues";
import {useUserContext} from "@/providers/user-context-provider";
import {Badge} from "@/components/ui/badge";
import {privateKeyToAccount} from "viem/accounts";
import {NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS} from "@/lib/constants";
import {toast} from "@/components/ui/use-toast";
import {useAccount, useWriteContract} from "wagmi";
import {TabsContent} from "@radix-ui/react-tabs";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {ToastAction} from "@/components/ui/toast";

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
  const {
    analyseUserAndGenerateValues,
    updateUser,
    batchUploadValuesPinata,
    updateValuesBulk,
    fetchAllValues,
  } = useValues();
  const {
    userInfo,
    setUserInfo,

    setValuesAvailable,
  } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [loaderText, setLoaderText] = useState("Analyzing your values");
  const [error, setError] = useState<{
    platform: string;
    message: string;
  } | null>(null);
  const {address} = useAccount();
  const {writeContractAsync} = useWriteContract();
  const [loader, setLoader] = useState(false);

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

  const batchMintValues = async ({
    platform,
  }: {
    platform: "WARPCAST" | "TWITTER";
  }) => {
    if (!address && userInfo?.wallets?.length === 0) {
      toast({
        title: "Please connect a wallet",
        description: "You need to connect a wallet to mint values",
        variant: "destructive",
      });
      return;
    }
    setLoader(true);
    const cids = await batchUploadValuesPinata({
      values:
        platform === "TWITTER"
          ? userInfo?.aiGeneratedValues?.twitter ?? []
          : platform === "WARPCAST"
          ? userInfo?.aiGeneratedValues?.warpcast ?? []
          : [],
    });
    const response = await fetchAllValues();

    setValuesAvailable(response.values);

    await mintValues({
      platform,
      valuesAvailable: response.values,
    });
    setLoader(false);
  };

  const mintValues = async ({
    platform,
    valuesAvailable,
  }: {
    platform: "WARPCAST" | "TWITTER";
    valuesAvailable: any;
  }) => {
    const wallets = [...(userInfo?.wallets ?? []), address!];
    if (!wallets) {
      toast({
        title: "Please connect a wallet",
        description: "You need to connect a wallet to mint values",
        variant: "destructive",
      });
      return;
    }
    setLoader(true);

    const cidsToMint = [];
    const valuesMinted = [];
    const valuesToMint =
      platform === "WARPCAST"
        ? userInfo?.aiGeneratedValues?.warpcast
        : userInfo?.aiGeneratedValues?.twitter;
    if (!valuesToMint) {
      setLoader(false);
      return;
    }

    if (
      userInfo?.aiGeneratedValues &&
      (userInfo?.aiGeneratedValues?.twitter?.length > 0 ||
        userInfo?.aiGeneratedValues?.warpcast?.length > 0)
    )
      for (const value of valuesToMint) {
        if (!userInfo) return;
        const existingValue = valuesAvailable![value.toLowerCase()];

        if (existingValue) {
          if (
            existingValue.minters?.includes(
              (userInfo?.email || userInfo?.farcaster?.toString()) as string
            )
          ) {
            continue;
          }

          cidsToMint.push(existingValue.cid);
          valuesMinted.push(value.toLowerCase());
        }
      }
    if (cidsToMint.length === 0) {
      setLoader(false);
      toast({
        title: "You already hold these Values",
        description: "View them in your wallet",
        variant: "destructive",
        action: (
          <ToastAction
            altText="profile"
            onClick={() => {
              window.location.href = `/profile`;
            }}
          >
            View
          </ToastAction>
        ),
      });
      return;
    }
    const hash = await writeContractAsync({
      abi: NFT_CONTRACT_ABI,
      address: NFT_CONTRACT_ADDRESS,
      functionName: "batchMint",
      args: [wallets[0], cidsToMint],
      account: privateKeyToAccount(
        process.env.NEXT_PUBLIC_ADMIN_WALLET_PRIVATE_KEY as `0x${string}`
      ),
      chainId: 84532,
    });

    setUserInfo({
      ...userInfo,
      mintedValues: [
        ...(userInfo?.mintedValues || []), // Spread the existing mintedValues
        ...valuesMinted.map((value) => ({
          // Append new values
          value: value,
          txHash: hash,
        })),
      ],
    });

    await updateValuesBulk({
      values: valuesMinted,
    });
    if (hash) {
      toast({
        title: "We just dropped Value NFTs to your wallet",
        description: "View them in your wallet",
        action: (
          <ToastAction
            altText="basescan"
            onClick={() => {
              window.open(
                `${process.env.NEXT_PUBLIC_BASESCAN_URL}/tx/${hash}`,
                "_blank"
              );
            }}
          >
            Basescan
          </ToastAction>
        ),
      });
    } else {
      toast({
        title: "You already hold these Values",
        description: "View them in your wallet",
        action: (
          <ToastAction
            altText="profile"
            onClick={() => {
              window.location.href = `/profile`;
            }}
          >
            View
          </ToastAction>
        ),
      });
    }

    setLoader(false);
  };

  useEffect(() => {
    const addTwitterHandle = async () => {
      if (user?.twitter?.username) {
        await updateUser({twitter: user.twitter.username});
        setUserInfo({...userInfo, twitter: user.twitter.username});
      }
    };
    addTwitterHandle();
  }, [user]);
  useEffect(() => {
    const addWarpcastAccount = async () => {
      if (user?.farcaster?.fid) {
        await updateUser({farcaster: user.farcaster.fid});
        setUserInfo({...userInfo, farcaster: user.farcaster.fid});
      }
    };
    addWarpcastAccount();
  }, [user]);

  return (
    <>
      {authenticated && (
        <div className="py-4 flex flex-col min-h-[80vh] gap-4">
          <div className="flex flex-col gap-4">
            <h2 className="scroll-m-20 text-center border-b pb-2 text-3xl font-medium tracking-tight first:mt-0 max-w-5xl text-muted-foreground">
              || ai generated values
            </h2>
            <Tabs defaultValue={"warpcast"} className="w-full">
              <TabsList className="flex justify-center py-4 text-black">
                <TabsTrigger
                  value="warpcast"
                  className="text-md text-wrap md:text-lg  w-[50%] md:py-[1px] "
                >
                  Warpcast
                </TabsTrigger>
                <TabsTrigger
                  value="twitter"
                  className="text-md text-wrap md:text-lg w-[50%] md:py-[1px]"
                >
                  Twitter
                </TabsTrigger>{" "}
              </TabsList>

              <TabsContent value="twitter">
                {userInfo?.aiGeneratedValues &&
                  userInfo?.aiGeneratedValues?.twitter?.length > 0 &&
                  userInfo?.aiGeneratedValues?.twitter.every((str) =>
                    userInfo?.mintedValues?.some(
                      (mintedValue) => mintedValue.value === str.toLowerCase()
                    )
                  ) && (
                    <Alert className="bg-[#88fc03] my-2 text-black">
                      <AlertDescription>
                        You have already minted these value NFTs.
                      </AlertDescription>
                    </Alert>
                  )}
                {
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-4 font-medium mt-4">
                    {userInfo &&
                      userInfo.aiGeneratedValues?.twitter?.map(
                        (value, index) => (
                          <Badge
                            key={index}
                            className="rounded-sm text-[18px] bg-transparent border border-primary text-primary hover:bg-transparent"
                          >
                            {value}
                          </Badge>
                        )
                      )}
                  </div>
                }
                {!(
                  userInfo?.aiGeneratedValues &&
                  userInfo?.aiGeneratedValues?.twitter?.length > 0 &&
                  userInfo?.aiGeneratedValues?.twitter.every((str) =>
                    userInfo?.mintedValues?.some(
                      (mintedValue) => mintedValue.value === str.toLowerCase()
                    )
                  )
                ) &&
                  userInfo?.aiGeneratedValues &&
                  userInfo?.aiGeneratedValues?.twitter?.length > 0 &&
                  (address || (userInfo?.wallets?.length ?? 0) > 0) && (
                    <Button
                      variant={"default"}
                      className="w-full cursor-pointer mt-4"
                      onClick={() => {
                        batchMintValues({platform: "TWITTER"});
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
                      <h2 className="scroll-m-20 border-b pb-2 text-md tracking-tight first:mt-0 max-w-5xl text-center">
                        super early feature, still in development
                      </h2>

                      {error && error.platform === "INSUFFICIENT_TWEETS" && (
                        <Alert
                          variant={"destructive"}
                          className=" my-2 bg-[#ff4747] text-white"
                        >
                          <AlertDescription>{error.message}</AlertDescription>
                        </Alert>
                      )}

                      {userInfo && userInfo?.twitter && (
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

                {((error && error.platform === "twitter") ||
                  userInfo?.twitter === undefined) && (
                  <div className="flex flex-col gap-2 justify-center">
                    <p className="text-center mt-2">
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
                {userInfo?.aiGeneratedValues &&
                  userInfo?.aiGeneratedValues?.warpcast?.length > 0 &&
                  userInfo?.aiGeneratedValues?.warpcast.every((str) =>
                    userInfo?.mintedValues?.some(
                      (mintedValue) => mintedValue.value === str.toLowerCase()
                    )
                  ) && (
                    <Alert className="bg-[#88fc03] my-2 text-black">
                      <AlertDescription>
                        You have already minted these value NFTs.
                      </AlertDescription>
                    </Alert>
                  )}
                {
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-4 font-medium mt-4">
                    {userInfo &&
                      userInfo.aiGeneratedValues?.warpcast?.map(
                        (value, index) => (
                          <Badge
                            key={index}
                            className="rounded-sm text-[18px] bg-transparent border border-primary text-primary hover:bg-transparent "
                          >
                            {value}
                          </Badge>
                        )
                      )}
                  </div>
                }
                {!(
                  userInfo?.aiGeneratedValues &&
                  userInfo?.aiGeneratedValues?.warpcast?.length > 0 &&
                  userInfo?.aiGeneratedValues?.warpcast.every((str) =>
                    userInfo?.mintedValues?.some(
                      (mintedValue) => mintedValue.value === str.toLowerCase()
                    )
                  )
                ) &&
                  userInfo?.aiGeneratedValues &&
                  userInfo?.aiGeneratedValues?.warpcast?.length > 0 && (
                    <Button
                      variant={"default"}
                      className="w-full cursor-pointer mt-4"
                      onClick={() => {
                        batchMintValues({platform: "WARPCAST"});
                      }}
                      disabled={loader}
                    >
                      {loader ? "Minting..." : "Mint Values"}
                    </Button>
                  )}

                {!loading &&
                  userInfo?.aiGeneratedValues &&
                  userInfo?.aiGeneratedValues?.warpcast?.length === 0 && (
                    <div className="flex flex-col gap-4">
                      <h2 className="scroll-m-20 border-b pb-2 text-md tracking-tight first:mt-0 max-w-5xl text-center">
                        We are building an AI model that takes your content and
                        drills it down to Values. While this is not completely
                        accurate, the more data we get, the better we can train
                        the model.<br></br>
                        <br></br> Think of this as a starting point to make your
                        values tangible. Not the final solution. <br></br>
                        <br></br>You can mint these values to start with. They
                        are accurate enough to connect you to aligned people and
                        communities.<br></br>
                        <br></br> Once you are done, mint your Community Values
                        and try minting manually too.
                      </h2>
                      {error && error.platform === "INSUFFICIENT_CASTS" && (
                        <Alert
                          variant={"destructive"}
                          className=" my-2 bg-[#ff4747] text-white"
                        >
                          <AlertDescription>{error.message}</AlertDescription>
                        </Alert>
                      )}

                      {userInfo && userInfo.farcaster && (
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

                {((error && error.platform === "warpcast") ||
                  userInfo?.farcaster === undefined) && (
                  <div className="flex flex-col gap-2 justify-center">
                    <p className="text-center mt-2">
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
