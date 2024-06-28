"use client";
import {useEffect, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ToastAction} from "@/components/ui/toast";
import {toast} from "@/components/ui/use-toast";
import ValuesWordCloud from "@/components/ui/values-word-cloud";
import {
  TbCircleNumber1Filled,
  TbCircleNumber2Filled,
  TbCircleNumber3Filled,
} from "react-icons/tb";

import {useUserContext} from "@/providers/user-context-provider";

import {SearchIcon, Twitter} from "lucide-react";
import {usePrivy} from "@privy-io/react-auth";
import {useAccount} from "wagmi";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import useValuesHook from "@/app/hooks/useValuesHook";
import {NFT_CONTRACT_ADDRESS} from "@/constants";
import Projects from "./projects";
import ValuePage from "@/app/value/page";
import {Badge} from "./ui/badge";

const HomeComponent = () => {
  const {userInfo, setUserInfo, valuesRecommendation} = useUserContext();
  const {mintHandler} = useValuesHook();
  const {user, linkWallet, login, ready, authenticated, linkEmail} = usePrivy();
  const {address} = useAccount();
  const [filteredData, setFilteredData] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [onMintingSuccessful, setOnMintingSuccessful] = useState(false);
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});

  function searchInValues(input: string): string[] {
    return valuesRecommendation.filter((item) =>
      item.toLowerCase().includes(input.toLowerCase())
    );
  }

  useEffect(() => {
    const filter = async () => {
      if (searchValue.length === 0) {
        setFilteredData(valuesRecommendation);
        return;
      }
      const filtered = searchInValues(searchValue);
      setFilteredData(filtered);
    };
    filter();
  }, [searchValue]);

  return (
    <div className="flex justify-center mb-12">
      <div className="flex flex-col md:w-[900px] w-[98vw] max-w-[98%] m-auto">
        <ValuesWordCloud refresh={valuesRecommendation} />

        <Accordion
          type="single"
          collapsible
          defaultValue={"ai"}
          className="w-[95%] m-auto"
        >
          <AccordionItem value="ai">
            <AccordionTrigger className="scroll-m-20 text-2xl font-semibold tracking-tight bg-gray-300 px-4">
              <div className="flex flex-row gap-2 items-center justify-center">
                <TbCircleNumber1Filled /> AI Value Analysis
                {userInfo?.aiGeneratedValues?.twitter &&
                userInfo?.aiGeneratedValues?.warpcast &&
                userInfo.aiGeneratedValues.twitter.length > 0 &&
                userInfo.aiGeneratedValues.warpcast.length > 0 ? (
                  <Badge className="bg-green-300 text-black"> Completed</Badge>
                ) : (
                  <Badge>Pending</Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ValuePage />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="community">
            <AccordionTrigger className="scroll-m-20 text-2xl font-semibold tracking-tight bg-gray-300 px-4">
              <div className="flex flex-row gap-2 items-center justify-center">
                <TbCircleNumber2Filled />

                <div className="flex flex-col  md:flex-row gap-2 items-center">
                  <span>Community Mint</span>
                  {userInfo?.communitiesMinted &&
                  userInfo?.communitiesMinted?.length > 0 ? (
                    <Badge className="bg-green-300 text-black w-fit h-fit">
                      Minted values from{" "}
                      {userInfo?.communitiesMinted?.length -
                        (userInfo?.communitiesMinted?.includes("warpcast")
                          ? 1
                          : 0) -
                        (userInfo?.communitiesMinted?.includes("twitter")
                          ? 1
                          : 0)}{" "}
                      communities
                    </Badge>
                  ) : (
                    <Badge className="w-fit h-fit">Pending</Badge>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Projects
                limit={3}
                style="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="manual">
            <AccordionTrigger className="scroll-m-20 text-2xl font-semibold tracking-tight bg-gray-300 px-4">
              <div className="flex flex-row gap-2 items-center justify-center">
                <TbCircleNumber3Filled /> Manual Mint
                {userInfo?.mintedValues &&
                userInfo?.mintedValues?.length > 0 &&
                userInfo.balance === 0 ? (
                  <Badge className="bg-green-300 text-black">Completed</Badge>
                ) : (
                  <Badge>Pending</Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="py-12 px-2">
              <h2 className="scroll-m-20 py-4 text-center border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 max-w-5xl text-muted-foreground mb-2">
                || manual mint
              </h2>
              {userInfo && userInfo.balance !== undefined && (
                <div className="flex flex-row justify-between items-center ">
                  <p className="p-4">Balance: ${userInfo.balance}</p>
                </div>
              )}
              <div className="relative ">
                <Input
                  placeholder="Search for values"
                  className="w-full h-12 "
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />

                <div className="absolute inset-y-0 right-3 pl-3 flex items-center cursor-pointer">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {authenticated ? (
                <>
                  {(user?.email?.address || user?.farcaster?.fid) && (
                    <section>
                      {searchValue.length > 0 &&
                        filteredData &&
                        filteredData.map((value, index) => {
                          return (
                            <div
                              key={index}
                              className="w-full h-14 px-3 flex items-center hover:bg-gray-300/20 hover:cursor-pointer rounded-sm"
                            >
                              <span> {value}</span>

                              {address ||
                              (userInfo &&
                                userInfo.wallets &&
                                userInfo.wallets?.length > 0) ? (
                                <Button
                                  variant="default"
                                  className="ml-auto h-8 w-32"
                                  disabled={loading[value]}
                                  onClick={async () => {
                                    setLoading({
                                      ...loading,
                                      [value]: true,
                                    });
                                    const response = await mintHandler({
                                      values: [{name: value, weightage: "1"}],
                                      type: "manual",
                                    });
                                    if (response) {
                                      setUserInfo(response.user);
                                      toast({
                                        title: "Minted Successfully.",

                                        action: (
                                          <ToastAction
                                            onClick={() => {
                                              window.open(
                                                `https://testnets.opensea.io/assets/base-sepolia/${NFT_CONTRACT_ADDRESS}/${Number(
                                                  userInfo?.profileNft
                                                )}`,
                                                "_blank"
                                              );
                                            }}
                                            altText="View in Opensea"
                                          >
                                            View on Opensea
                                          </ToastAction>
                                        ),
                                      });
                                      setOnMintingSuccessful(true);
                                      setUserInfo({
                                        ...userInfo,
                                        balance: Number(userInfo?.balance) - 1,
                                      });
                                    } else if (!response) {
                                      toast({
                                        title: "Minting Failed.",
                                        description: "Please try again later",
                                        variant: "destructive",
                                      });
                                    }
                                    setLoading({
                                      ...loading,
                                      [value]: false,
                                    });
                                  }}
                                >
                                  {loading[value] ? (
                                    <div className="flex flex-row gap-2">
                                      Minting{" "}
                                      <div className="animate-spin rounded-full h-6 w-6 border-4 border-dashed border-white"></div>
                                    </div>
                                  ) : (
                                    "Mint"
                                  )}
                                </Button>
                              ) : (
                                <div className="ml-auto">
                                  <Button
                                    variant="default"
                                    onClick={linkWallet}
                                  >
                                    Connect Wallet
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}

                      {filteredData &&
                        searchValue.length > 0 &&
                        filteredData.length === 0 && (
                          <div className="w-full h-14 px-3 flex items-center hover:bg-gray-300/20 hover:cursor-pointer rounded-sm">
                            <span> {searchValue}</span>

                            {address ||
                            (userInfo &&
                              userInfo.wallets &&
                              userInfo.wallets?.length > 0) ? (
                              <Button
                                variant="default"
                                className="ml-auto h-8 w-32"
                                disabled={loading[searchValue]}
                                onClick={async () => {
                                  setLoading({
                                    ...loading,
                                    [searchValue]: true,
                                  });
                                  const response = await mintHandler({
                                    values: [
                                      {name: searchValue, weightage: "1"},
                                    ],
                                  });
                                  if (response) {
                                    setOnMintingSuccessful(true);
                                    setUserInfo(response.user);

                                    toast({
                                      title: "Minted Successfully.",

                                      action: (
                                        <ToastAction
                                          onClick={() => {
                                            window.open(
                                              `https://testnets.opensea.io/assets/base-sepolia/${NFT_CONTRACT_ADDRESS}/${Number(
                                                userInfo?.profileNft
                                              )}`,
                                              "_blank"
                                            );
                                          }}
                                          altText="View in Opensea"
                                        >
                                          View on Opensea
                                        </ToastAction>
                                      ),
                                    });

                                    setUserInfo({
                                      ...userInfo,
                                      balance: Number(userInfo?.balance) - 1,
                                    });
                                  } else if (!response) {
                                    toast({
                                      title: "Minting Failed.",
                                      description: "Please try again later",
                                      variant: "destructive",
                                    });
                                  }
                                  setLoading({
                                    ...loading,
                                    [searchValue]: false,
                                  });
                                }}
                              >
                                {loading[searchValue] ? (
                                  <div className="flex flex-row gap-2">
                                    Minting{" "}
                                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-dashed border-white"></div>
                                  </div>
                                ) : (
                                  "Mint"
                                )}
                              </Button>
                            ) : (
                              <div className="ml-auto">
                                <Button variant="default" onClick={linkWallet}>
                                  Connect Wallet
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                      {searchValue.length === 0 && (
                        <div className="flex justify-center items-center p-4">
                          <span className="font-semibold  text-gray-700 text-lg">
                            Type out your values and mint them
                          </span>{" "}
                        </div>
                      )}
                    </section>
                  )}
                </>
              ) : (
                <section className="md:w-[900px] pl-4 h-14  flex flex-row justify-between items-center hover:bg-gray-300/20 hover:cursor-pointer rounded-sm mt-4">
                  <span className="font-semibold  text-gray-300 text-lg">
                    Login to proceed
                  </span>
                  <Button variant="default" onClick={login}>
                    Login
                  </Button>
                </section>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {/* 
        <Tabs defaultValue="ai" className="w-[96%] m-auto">
          <TabsList className="flex justify-center py-8 md:py-4 text-black">
            <TabsTrigger
              value="ai"
              className="text-md text-wrap md:text-lg font-semibold  py-[3px]"
            >
              AI Value Analysis
            </TabsTrigger>{" "}
            <TabsTrigger
              value="community"
              className="text-md text-wrap md:text-lg font-semibold  py-[3px]"
            >
              Community Mint
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="text-md text-wrap md:text-lg font-semibold  py-[3px]"
            >
              Manual Mint
            </TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <h2 className="scroll-m-20 py-4 text-center border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 max-w-5xl text-muted-foreground mb-2">
              || manual mint
            </h2>
            {userInfo?.balance && (
              <div className="flex flex-row justify-between items-center ">
                <p className="p-4">Balance: ${userInfo?.balance}</p>
              </div>
            )}
            <div className="relative ">
              <Input
                placeholder="Search for values"
                className="w-full h-12 "
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />

              <div className="absolute inset-y-0 right-3 pl-3 flex items-center cursor-pointer">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            {authenticated ? (
              <>
                {(user?.email?.address || user?.farcaster?.fid) && (
                  <section>
                    {searchValue.length > 0 &&
                      filteredData &&
                      filteredData.map((value, index) => {
                        return (
                          <div
                            key={index}
                            className="w-full h-14 px-3 flex items-center hover:bg-gray-300/20 hover:cursor-pointer rounded-sm"
                          >
                            <span> {value}</span>

                            {address ||
                            (userInfo &&
                              userInfo.wallets &&
                              userInfo.wallets?.length > 0) ? (
                              <Button
                                variant="default"
                                className="ml-auto h-8 w-32"
                                disabled={loading[value]}
                                onClick={async () => {
                                  setLoading({
                                    ...loading,
                                    [value]: true,
                                  });
                                  const response = await mintHandler({
                                    values: [{name: value, weightage: "1"}],
                                    type: "manual",
                                  });
                                  if (response) {
                                    console.log(response);
                                    setUserInfo(response.user);
                                    toast({
                                      title: "Minted Successfully.",

                                      action: (
                                        <ToastAction
                                          onClick={() => {
                                            window.open(
                                              `https://testnets.opensea.io/assets/base-sepolia/${NFT_CONTRACT_ADDRESS}/${Number(
                                                userInfo?.profileNft
                                              )}`,
                                              "_blank"
                                            );
                                          }}
                                          altText="View in Opensea"
                                        >
                                          View on Opensea
                                        </ToastAction>
                                      ),
                                    });
                                    setOnMintingSuccessful(true);
                                    setUserInfo({
                                      ...userInfo,
                                      balance: Number(userInfo?.balance) - 1,
                                    });
                                  } else if (!response) {
                                    console.log(response);
                                    toast({
                                      title: "Minting Failed.",
                                      description: "Please try again later",
                                      variant: "destructive",
                                    });
                                  }
                                  setLoading({
                                    ...loading,
                                    [value]: false,
                                  });
                                }}
                              >
                                {loading[value] ? (
                                  <div className="flex flex-row gap-2">
                                    Minting{" "}
                                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-dashed border-white"></div>
                                  </div>
                                ) : (
                                  "Mint"
                                )}
                              </Button>
                            ) : (
                              <div className="ml-auto">
                                <Button variant="default" onClick={linkWallet}>
                                  Connect Wallet
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                    {filteredData &&
                      searchValue.length > 0 &&
                      filteredData.length === 0 && (
                        <div className="w-full h-14 px-3 flex items-center hover:bg-gray-300/20 hover:cursor-pointer rounded-sm">
                          <span> {searchValue}</span>

                          {address ||
                          (userInfo &&
                            userInfo.wallets &&
                            userInfo.wallets?.length > 0) ? (
                            <Button
                              variant="default"
                              className="ml-auto h-8 w-32"
                              disabled={loading[searchValue]}
                              onClick={async () => {
                                setLoading({
                                  ...loading,
                                  [searchValue]: true,
                                });
                                const response = await mintHandler({
                                  values: [{name: searchValue, weightage: "1"}],
                                });
                                if (response) {
                                  console.log(response);
                                  setOnMintingSuccessful(true);
                                  setUserInfo(response.user);

                                  toast({
                                    title: "Minted Successfully.",

                                    action: (
                                      <ToastAction
                                        onClick={() => {
                                          window.open(
                                            `https://testnets.opensea.io/assets/base-sepolia/${NFT_CONTRACT_ADDRESS}/${Number(
                                              userInfo?.profileNft
                                            )}`,
                                            "_blank"
                                          );
                                        }}
                                        altText="View in Opensea"
                                      >
                                        View on Opensea
                                      </ToastAction>
                                    ),
                                  });

                                  setUserInfo({
                                    ...userInfo,
                                    balance: Number(userInfo?.balance) - 1,
                                  });
                                } else if (!response) {
                                  toast({
                                    title: "Minting Failed.",
                                    description: "Please try again later",
                                    variant: "destructive",
                                  });
                                }
                                setLoading({
                                  ...loading,
                                  [searchValue]: false,
                                });
                              }}
                            >
                              {loading[searchValue] ? (
                                <div className="flex flex-row gap-2">
                                  Minting{" "}
                                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-dashed border-white"></div>
                                </div>
                              ) : (
                                "Mint"
                              )}
                            </Button>
                          ) : (
                            <div className="ml-auto">
                              <Button variant="default" onClick={linkWallet}>
                                Connect Wallet
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                    {searchValue.length === 0 && (
                      <div className="flex justify-center items-center p-4">
                        <span className="font-semibold  text-gray-300 text-lg">
                          Type out your values and mint them
                        </span>{" "}
                      </div>
                    )}
                  </section>
                )}
              </>
            ) : (
              <section className="md:w-[900px] pl-4 h-14  flex flex-row justify-between items-center hover:bg-gray-300/20 hover:cursor-pointer rounded-sm mt-4">
                <span className="font-semibold  text-gray-300 text-lg">
                  Login to proceed
                </span>
                <Button variant="default" onClick={login}>
                  Login
                </Button>
              </section>
            )}
          </TabsContent>
          <TabsContent value="ai">
            <ValuePage />
          </TabsContent>
          <TabsContent value="community">
            <Projects
              limit={3}
              style="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            />
          </TabsContent>
        </Tabs> */}

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
    </div>
  );
};

export default HomeComponent;
