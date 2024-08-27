import React, {useEffect, useState} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useUserContext} from "@/providers/user-context-provider";
import {Button} from "./ui/button";
import ValueBadge from "./ui/value-badge";
import {Alert, AlertDescription} from "./ui/alert";
import useValuesHook from "@/hooks/useValuesHook";
import ValueGeneratingLoader from "./ui/value-generating-loader";
import SpectrumCard from "./ui/spectrum-card";
import {useLinkAccount, usePrivy} from "@privy-io/react-auth";
import {NFT_CONTRACT_ADDRESS} from "@/constants";

const AiValueComponent = () => {
  const {user} = usePrivy();
  return (
    <section className="w-[92%] md:w-[70%] m-auto mt-0 md:mt-12">
      <h2 className="scroll-m-20 border-b pb-2 text-2xl md:text-4xl font-medium tracking-tight text-center mb-2 md:mb-8">
        AI Value analysis
      </h2>
      <Tabs
        defaultValue={user?.twitter?.subject ? "twitter" : "warpcast"}
        className="w-full"
      >
        <TabsList className="w-full h-12 p-2">
          <TabsTrigger
            className="w-[50%] font-semibold text-md"
            value="warpcast"
          >
            Warpcast
          </TabsTrigger>
          <TabsTrigger
            className="w-[50%] font-semibold text-md"
            value="twitter"
          >
            Twitter
          </TabsTrigger>
        </TabsList>
        <TabsContent value="warpcast">
          <WarpcastTab />
        </TabsContent>
        <TabsContent value="twitter">
          <TwitterTab />
        </TabsContent>
      </Tabs>
    </section>
  );
};

const WarpcastTab = () => {
  const {userInfo, setUserInfo} = useUserContext();
  const {generateValues, mintValues} = useValuesHook();
  const [generatingValues, setGeneratingValues] = useState(false);
  const [mintingValues, setMintingValues] = useState(false);
  const {linkFarcaster} = usePrivy();
  const [error, setError] = useState<string | null>(null);
  const handleGenerateValues = async () => {
    if (!userInfo) {
      return;
    }
    setGeneratingValues(true);
    const response = await generateValues({
      source: "farcaster",
      userId: userInfo.userId,
      farcaster: {fid: userInfo.fid!},
    });

    if ("error" in response) {
      console.error(response.error);
      setError(response.error);
    } else {
      setUserInfo(response);
    }
    setGeneratingValues(false);
  };

  const handleMint = async () => {
    if (!userInfo) return;
    if (userInfo && userInfo.generatedValues.warpcast.length === 0) return;
    setMintingValues(true);
    const response = await mintValues({
      userId: userInfo.userId,
      values: userInfo.generatedValues.warpcast,
      source: "warpcast",
    });
    if ("error" in response) {
      console.error(response.error);
      setError(response.error);
    } else {
      setUserInfo(response);
    }
    setMintingValues(false);
  };
  return (
    <div className="w-full flex flex-col py-2 mb-8">
      {error && (
        <Alert className="border-red-600 text-red-600 my-4">
          <AlertDescription className="text-md font-light">
            {error}
          </AlertDescription>
        </Alert>
      )}
      {userInfo && userInfo.generatedValues.warpcast.length === 0 && (
        <div className="w-full flex flex-col gap-4 items-center">
          <h4 className="scroll-m-20 text-md md:text-xl font-medium tracking-tight">
            Generate your Values from your Warpcast data
          </h4>
          {userInfo && !userInfo.fid && (
            <div className="w-full">
              <Alert className="border-red-600 text-red-600">
                <AlertDescription className="text-md font-light">
                  Link your Warpcast account to generate your Values.
                </AlertDescription>
              </Alert>
              <Button className="mt-4 w-full text-md" onClick={linkFarcaster}>
                Link Warpcast
              </Button>
            </div>
          )}
          {!generatingValues && (
            <Button
              className="mt-4 w-full text-md "
              onClick={handleGenerateValues}
              disabled={!userInfo.fid}
            >
              Analyse my Values
            </Button>
          )}

          {generatingValues && <ValueGeneratingLoader />}
        </div>
      )}

      {userInfo &&
        Object.keys(userInfo.generatedValuesWithWeights.warpcast).length >
          0 && (
          <div className="w-full flex flex-col gap-4">
            {userInfo &&
              userInfo.generatedValues.warpcast.length > 0 &&
              userInfo.socialValuesMinted.includes("warpcast") && (
                <Alert className="bg-green-300 text-black">
                  <AlertDescription className="text-md font-light">
                    You have minted these Values. Checkout your ValuesDAO
                    Profile to see your Values {"=>"}{" "}
                    <a
                      href={`https://${
                        process.env.NEXT_PUBLIC_APP_ENV !== "prod"
                          ? ""
                          : "testnets."
                      }opensea.io/assets/${
                        process.env.NEXT_PUBLIC_APP_ENV === "prod"
                          ? "base"
                          : "base-sepolia"
                      }/${NFT_CONTRACT_ADDRESS}/${userInfo.profileNft}`}
                      target="_blank"
                      className="border-b border-black cursor-pointer"
                    >
                      Profile
                    </a>
                  </AlertDescription>
                </Alert>
              )}
            <h4 className="scroll-m-20 border-b text-3xl font-medium tracking-tight mb-2 mt-4">
              Values
            </h4>
            <div className="w-full flex flex-row gap-2 items-center flex-wrap">
              {Object.keys(userInfo.generatedValuesWithWeights.warpcast)
                .slice(0, 7)
                .map((value, index) => (
                  <ValueBadge
                    key={index}
                    value={value}
                    weight={userInfo.generatedValuesWithWeights.warpcast[value]}
                  />
                ))}
            </div>
          </div>
        )}
      {userInfo &&
        userInfo.generatedValues.warpcast.length > 0 &&
        !userInfo.socialValuesMinted.includes("warpcast") && (
          <Button
            className="mt-4 w-full text-md"
            onClick={handleMint}
            disabled={mintingValues}
          >
            {mintingValues ? "Minting Values" : "Mint my Values"}
          </Button>
        )}

      {userInfo && userInfo.spectrum.warpcast.length > 0 && (
        <div className="w-full flex flex-col gap-4 mt-8">
          <h4 className="scroll-m-20 border-b text-3xl font-medium tracking-tight mb-2 mt-4">
            Value Spectrum
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userInfo.spectrum.warpcast.map((value, index) => (
              <SpectrumCard
                key={index}
                name={value.name}
                score={value.score}
                description={value.description}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
const TwitterTab = () => {
  const {userInfo, setUserInfo} = useUserContext();
  const {generateValues, attachTwitter, mintValues} = useValuesHook();
  const [generatingValues, setGeneratingValues] = useState(false);
  const {user} = usePrivy();
  const [mintingValues, setMintingValues] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {linkTwitter} = useLinkAccount({
    onSuccess: async (user, linkMethod, linkedAccount) => {
      const response = await attachTwitter({
        userId: userInfo?.userId!,
        username: user.twitter?.username!,
        id: user.twitter?.subject!,
      });

      if ("error" in response) {
        console.error(response.error);
        setError("Error linking Twitter account");
      } else {
        setUserInfo(response);
      }
    },

    onError: (e) => {
      setError("Error linking Twitter account");
    },
  });
  const handleGenerateValues = async () => {
    if (!userInfo || !user?.twitter?.subject) {
      return;
    }
    setGeneratingValues(true);
    const response = await generateValues({
      source: "twitter",
      userId: userInfo.userId,
      twitter: {
        id: userInfo.twitterId!,
        username: userInfo.twitterUsername!,
      },
    });

    if ("error" in response) {
      console.error(response.error);
      setError(response.error);
    } else {
      setUserInfo(response);
    }
    setGeneratingValues(false);
  };

  const handleMint = async () => {
    if (!userInfo) return;
    if (userInfo && userInfo.generatedValues.twitter.length === 0) return;
    setMintingValues(true);
    const response = await mintValues({
      userId: userInfo.userId,
      values: userInfo.generatedValues.twitter,
      source: "twitter",
    });
    if ("error" in response) {
      console.error(response.error);
      setError(response.error);
    } else {
      setUserInfo(response);
    }
    setMintingValues(false);
  };

  return (
    <div className="w-full flex flex-col py-2 mb-8">
      {error && (
        <Alert className="border-red-600 text-red-600">
          <AlertDescription className="text-md font-light">
            {error}
          </AlertDescription>
        </Alert>
      )}
      {userInfo && userInfo.generatedValues.twitter.length === 0 && (
        <div className="w-full flex flex-col gap-4 items-center">
          <h4 className="scroll-m-20 text-md md:text-xl font-medium tracking-tight">
            Generate your values from your Twitter data
          </h4>
          {userInfo && !userInfo.twitterId && (
            <div className="w-full">
              <Alert className="border-red-600 text-red-600">
                <AlertDescription className="text-md font-light">
                  Link your Twitter account to generate your Values.
                </AlertDescription>
              </Alert>
              <Button className="mt-4 w-full text-md" onClick={linkTwitter}>
                Link Twitter
              </Button>
            </div>
          )}
          {!generatingValues && userInfo.twitterId && (
            <Button
              className="mt-4 w-full text-md "
              onClick={handleGenerateValues}
              disabled={!user?.twitter?.subject || !userInfo.twitterId}
            >
              Analyse my Values
            </Button>
          )}

          {generatingValues && <ValueGeneratingLoader />}
        </div>
      )}

      {userInfo &&
        Object.keys(userInfo.generatedValuesWithWeights.twitter).length > 0 && (
          <div className="w-full flex flex-col gap-4">
            {userInfo &&
              userInfo.generatedValues.twitter.length > 0 &&
              userInfo.socialValuesMinted.includes("twitter") && (
                <Alert className="bg-green-300 text-black">
                  <AlertDescription className="text-md font-light">
                    You have minted these Values. Checkout your ValuesDAO
                    Profile to see your Values {"=>"}{" "}
                    <a
                      href={`https://${
                        process.env.NEXT_PUBLIC_APP_ENV === "prod"
                          ? ""
                          : "testnets."
                      }opensea.io/assets/${
                        process.env.NEXT_PUBLIC_APP_ENV === "prod"
                          ? "base"
                          : "base-sepolia"
                      }/${NFT_CONTRACT_ADDRESS}/${userInfo.profileNft}`}
                      target="_blank"
                      className="border-b border-black cursor-pointer"
                    >
                      Profile
                    </a>
                  </AlertDescription>
                </Alert>
              )}
            <h4 className="scroll-m-20 border-b text-3xl font-medium tracking-tight mb-2 mt-4">
              Values
            </h4>
            <div className="w-full flex flex-row gap-2 items-center flex-wrap">
              {Object.keys(userInfo.generatedValuesWithWeights.twitter)
                .slice(0, 7)
                .map((value, index) => (
                  <ValueBadge
                    key={index}
                    value={value}
                    weight={userInfo.generatedValuesWithWeights.warpcast[value]}
                  />
                ))}
            </div>
          </div>
        )}
      {userInfo &&
        userInfo.generatedValues.twitter.length > 0 &&
        !userInfo.socialValuesMinted.includes("twitter") && (
          <Button
            className="mt-4 w-full text-md"
            onClick={handleMint}
            disabled={mintingValues}
          >
            {mintingValues ? "Minting Values" : "Mint my Values"}
          </Button>
        )}

      {userInfo && userInfo.spectrum.twitter.length > 0 && (
        <div className="w-full flex flex-col gap-4 mt-8">
          <h4 className="scroll-m-20 border-b text-3xl font-medium tracking-tight mb-2 mt-4">
            Value Spectrum
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userInfo.spectrum.twitter.map((value, index) => (
              <SpectrumCard
                key={index}
                name={value.name}
                score={value.score}
                description={value.description}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiValueComponent;
