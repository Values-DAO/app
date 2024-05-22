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

const ValuePage = () => {
  const {user, authenticated, ready, login, linkTwitter, linkFarcaster} =
    usePrivy();
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
    isLoading,
    valuesAvailable,
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

    setUserInfo({...userInfo, aiGeneratedValues: values});
    setLoading(false);
  };

  const batchMintValues = async () => {
    setLoader(true);
    await batchUploadValuesPinata({
      values: [
        ...(userInfo?.aiGeneratedValues?.twitter || []),
        ...(userInfo?.aiGeneratedValues?.warpcast || []),
      ],
    });
    const response = await fetchAllValues();

    setValuesAvailable(response.values);

    await mintValues();
    setLoader(false);
  };

  const mintValues = async () => {
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
    const valuesToMint = Array.from(
      new Set([
        ...(userInfo?.aiGeneratedValues?.twitter || []),
        ...(userInfo?.aiGeneratedValues?.warpcast || []),
      ])
    );

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

    await updateUser({
      values: valuesMinted.map((value) => {
        return {value: value, txHash: hash};
      }),
    });

    await updateValuesBulk({
      values: valuesMinted,
    });
    if (hash) {
      toast({
        title: "We just dropped Value NFTs to your wallet",
        description: "View them in your wallet",
      });
    } else {
      toast({
        title: "You already hold these Values",
        description: "View them in your wallet",
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
  return (
    <>
      {authenticated && (
        <div className="p-4 flex flex-col min-h-[80vh] gap-4">
          {!isLoading &&
            userInfo?.aiGeneratedValues &&
            (userInfo?.aiGeneratedValues?.twitter?.length > 0 ||
              userInfo?.aiGeneratedValues?.warpcast?.length > 0) && (
              <div className="flex flex-col gap-4">
                <h2 className="scroll-m-20 text-center border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 max-w-5xl text-muted-foreground">
                  Your values
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-4 font-medium">
                  {Array.from(
                    new Set([
                      ...(userInfo.aiGeneratedValues?.twitter || []),
                      ...(userInfo.aiGeneratedValues?.warpcast || []),
                    ])
                  ).map((value, index) => (
                    <Badge key={index} className="rounded-sm text-[18px]">
                      {value}
                    </Badge>
                  ))}
                </div>

                <Button
                  variant={"secondary"}
                  className="w-full cursor-pointer "
                  onClick={batchMintValues}
                  disabled={loader}
                >
                  {loader ? "Minting..." : "Mint Values"}
                </Button>
              </div>
            )}

          {!loading && !isLoading && (
            <div className="flex flex-col gap-4 items-center justify-center">
              {(userInfo?.aiGeneratedValues === undefined ||
                (userInfo?.aiGeneratedValues?.twitter?.length === 0 &&
                  userInfo?.aiGeneratedValues?.warpcast?.length === 0)) && (
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
              )}

              {error ? (
                <div className="flex flex-col gap-2 justify-center">
                  <p>Connect your account to continue</p>
                  <div className="flex flex-row gap-2 justify-center">
                    {!user?.twitter?.username &&
                      error.platform === "twitter" && (
                        <Button onClick={linkTwitter}>Link Twitter</Button>
                      )}
                    {!user?.farcaster?.fid && error.platform === "warpcast" && (
                      <Button onClick={linkFarcaster}>Link Warpcast</Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 justify-center">
                  {userInfo?.aiGeneratedValues?.twitter?.length === 0 &&
                    userInfo?.aiGeneratedValues?.warpcast?.length === 0 && (
                      <p>Analyse using my data from</p>
                    )}
                  <div className="flex flex-row gap-2 justify-center">
                    {userInfo?.aiGeneratedValues?.twitter?.length === 0 && (
                      <Button
                        onClick={() => {
                          analyse("twitter");
                        }}
                      >
                        Twitter
                      </Button>
                    )}

                    {userInfo?.aiGeneratedValues?.warpcast?.length === 0 && (
                      <Button
                        onClick={() => {
                          analyse("warpcast");
                        }}
                      >
                        Warpcast
                      </Button>
                    )}
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
