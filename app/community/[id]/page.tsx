"use client";
import React, {useEffect, useState} from "react";

import {IProject} from "@/models/project";
import {Button} from "@/components/ui/button";
import {useAccount, useDisconnect, useWriteContract} from "wagmi";

import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {RocketIcon, Twitter, WandSparklesIcon} from "lucide-react";

import {toast} from "@/components/ui/use-toast";
import {usePrivy} from "@privy-io/react-auth";
import {Separator} from "@/components/ui/separator";
import {getChainName} from "@/lib/utils";
import {Skeleton} from "@/components/ui/skeleton";

import {useUserContext} from "@/providers/user-context-provider";
import useValuesHook from "@/app/hooks/useValuesHook";
import ValueBadge from "@/components/ui/value-badge";
import {ToastAction} from "@/components/ui/toast";
import {NFT_CONTRACT_ADDRESS} from "@/constants";
import Link from "next/link";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LoggedOutView from "@/components/logged-out-view";
interface pageProps {
  params: {id: string};
}

const ProjectsPage: React.FC<pageProps> = ({params}) => {
  const {user, authenticated, login, linkWallet} = usePrivy();
  const {userInfo, setUserInfo} = useUserContext();

  const {fetchCommunityProjects, isAHolderOfToken, mintHandler} =
    useValuesHook();
  const {address, isConnected} = useAccount();
  const {disconnect} = useDisconnect();
  const [project, setProject] = useState<IProject | null>(null);
  const [loader, setLoader] = useState(false);
  const [onMintingSuccessful, setOnMintingSuccessful] = useState(false);

  const [tokenBalance, setTokenBalance] = useState<number | null | undefined>(
    undefined
  );
  const id = params.id.split("-").pop();
  const [balanceLoader, setBalanceLoader] = useState(false);
  useEffect(() => {
    const fetchProjectData = async () => {
      setLoader(true);
      const projectData = await fetchCommunityProjects({id: id as string});
      if (projectData) setProject(projectData);
      setLoader(false);
    };

    fetchProjectData();
  }, []);

  useEffect(() => {
    const fetchUserTokenBalance = async () => {
      setBalanceLoader(true);
      const tokenbalance = await isAHolderOfToken({
        tokenAddress: project?.contractAddress as `0x${string}`,
        chain: Number(project?.chainId!),
      });

      if (tokenbalance != null) setTokenBalance(tokenbalance);
      setBalanceLoader(false);
    };
    fetchUserTokenBalance();
  }, [project, address, user, userInfo]);

  return (
    <>
      {" "}
      {loader ||
        !project ||
        (!userInfo && (
          <div className="w-[90vw] m-auto flex flex-col gap-4">
            <Skeleton className="w-full h-[320px] rounded-md" />
            <Skeleton className="w-full m-auto h-[30px] rounded-md" />
            <Skeleton className="w-full m-auto h-[30px] rounded-md" />
          </div>
        ))}
      {userInfo && (
        <main className="p-4 overflow-y-auto">
          {project && (
            <section className="flex flex-col items-center md:items-start md:flex-row gap-4">
              <div className="w-[90vw] m-auto">
                <span>#{project.id}</span>
                <h2 className="scroll-m-20 pb-2 text-xl font-medium tracking-tight first:mt-0">
                  {project?.name}
                </h2>
                <Separator />

                <p className="text-3xl font-semibold tracking-tight mt-8">
                  Values{" "}
                </p>
                <p className="my-2 text-muted-foreground">
                  If you hold a token/ NFT from this project in{" "}
                  {getChainName(Number(project?.chainId))} chain, you can mint
                  values for free.
                </p>
                <div className="flex flex-wrap flex-row gap-2 my-4 font-medium">
                  {project?.values.map((value, index) => (
                    <ValueBadge key={index} value={value} />
                  ))}
                </div>

                {!userInfo.wallets && !address && (
                  <Button
                    variant="secondary"
                    onClick={linkWallet}
                    className="w-full"
                  >
                    Connect Wallet
                  </Button>
                )}

                {!authenticated && (
                  <section className=" flex flex-col gap-2 rounded-sm mt-10 items-center bg-gray-300 p-4 border-[1px] border-black">
                    <span className="font-semibold text-lg">
                      Login to mint values
                    </span>
                    <Button variant="default" onClick={login} className="w-fit">
                      Login
                    </Button>
                  </section>
                )}

                {authenticated &&
                  tokenBalance != null &&
                  tokenBalance != undefined &&
                  balanceLoader === false &&
                  tokenBalance <= 0 && (
                    <Alert className="my-8">
                      <WandSparklesIcon className="h-4 w-4" />
                      <AlertTitle className="leading-2">
                        You don&apos;t hold any{" "}
                        {project.category === "NFT" || ("ERC721" as any)
                          ? "NFT"
                          : "tokens"}{" "}
                        from this project. You can connect a different wallet if
                        you have it there.
                      </AlertTitle>
                      <AlertDescription>
                        {isConnected ? (
                          <Button
                            className="mt-2 w-full md:w-64"
                            onClick={() => disconnect()}
                          >
                            Disconnect Wallet
                          </Button>
                        ) : (
                          <Button
                            className="mt-2 w-full md:w-64"
                            onClick={() => linkWallet()}
                          >
                            Connect Wallet
                          </Button>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                {authenticated &&
                  tokenBalance != null &&
                  tokenBalance > 0 &&
                  balanceLoader === false &&
                  !userInfo?.communitiesMinted?.includes(id!) && (
                    <Alert className="my-8">
                      <RocketIcon className="h-4 w-4" />
                      <AlertTitle>
                        You hold{" "}
                        {project.category === "ERC20" &&
                          tokenBalance.toFixed(2)}{" "}
                        {project.category === ("ERC721" as any)
                          ? "NFT"
                          : "tokens"}{" "}
                        from this project.
                      </AlertTitle>

                      <AlertDescription>
                        You can mint values for free.
                      </AlertDescription>
                    </Alert>
                  )}
                {authenticated &&
                  tokenBalance != null &&
                  tokenBalance > 0 &&
                  !userInfo?.communitiesMinted?.includes(id!) && (
                    <Button
                      className="mt-4 w-full"
                      disabled={tokenBalance <= 0 || loader}
                      onClick={async () => {
                        setLoader(true);
                        const response = await mintHandler({
                          values: project?.values.map((value) => {
                            return {name: value, weightage: "1"};
                          }),
                          type: "community",
                          communityId: id,
                        });
                        setLoader(false);
                        if (response) {
                          setUserInfo(response.user);
                          setOnMintingSuccessful(true);
                          toast({
                            title: "Minted Successfully.",

                            action: (
                              <ToastAction
                                onClick={() => {
                                  window.open(
                                    `https://opensea.io/assets/base/${NFT_CONTRACT_ADDRESS}/${Number(
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
                        } else if (!response) {
                          toast({
                            title: "Minting Failed.",
                            description: "Please try again later.",
                            variant: "destructive",
                          });
                        }
                      }}
                      variant="default"
                    >
                      {loader ? "Minting..." : "Mint Values"}
                    </Button>
                  )}

                {authenticated &&
                  userInfo?.communitiesMinted?.includes(id!) && (
                    <Alert className="my-8">
                      <WandSparklesIcon className="h-4 w-4" />
                      <AlertTitle>
                        You have already minted values for this project.
                      </AlertTitle>
                    </Alert>
                  )}
                {authenticated &&
                  tokenBalance == null &&
                  balanceLoader === false && (
                    <Alert className="my-8">
                      <WandSparklesIcon className="h-4 w-4" />
                      <AlertTitle className="leading-2">
                        Fetching token balance errored
                      </AlertTitle>
                    </Alert>
                  )}

                {authenticated && balanceLoader && (
                  <Alert className="my-8">
                    <WandSparklesIcon className="h-4 w-4" />
                    <AlertTitle className="leading-2">
                      Scanning your wallets...
                    </AlertTitle>
                  </Alert>
                )}
              </div>
            </section>
          )}
          <LoggedOutView />

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
        </main>
      )}
    </>
  );
};

export default ProjectsPage;
