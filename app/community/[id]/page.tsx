"use client";
import React, {useEffect, useState} from "react";

import {Badge} from "@/components/ui/badge";
import {IProject} from "@/models/project";
import {Button} from "@/components/ui/button";
import {useAccount, useDisconnect, useWriteContract} from "wagmi";

import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {RocketIcon, WandSparklesIcon} from "lucide-react";

import {privateKeyToAccount} from "viem/accounts";
import {toast} from "@/components/ui/use-toast";
import {usePrivy} from "@privy-io/react-auth";
import {NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS} from "@/lib/constants";
import {Separator} from "@/components/ui/separator";
import {getChainName} from "@/lib/utils";
import {Skeleton} from "@/components/ui/skeleton";
import InviteCodeModal from "@/components/invite-code-modal";
import useValues from "@/app/hooks/useValues";

import {useUserContext} from "@/providers/user-context-provider";

interface pageProps {
  params: {id: string};
}

const ProjectsPage: React.FC<pageProps> = ({params}) => {
  const {user, login, linkWallet} = usePrivy();
  const {userInfo, valuesAvailable} = useUserContext();
  const {
    fetchCommunityProjects,

    updateUser,
    isAHolderOfToken,
    updateValuesBulk,
  } = useValues();
  const {address} = useAccount();
  const {disconnect} = useDisconnect();
  const {writeContractAsync} = useWriteContract();
  const [project, setProject] = useState<IProject | null>(null);
  const [loader, setLoader] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const id = params.id.split("-").pop();

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoader(true);
      const projectData = await fetchCommunityProjects({id: id as string});
      if (projectData) setProject(projectData);
      setLoader(false);
    };

    fetchProjectData();
  }, []);

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
    if (project?.values)
      for (const value of project?.values) {
        if (!valuesAvailable || !userInfo) return;
        const existingValue = valuesAvailable[value.toLowerCase()];

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
    const fetchUserTokenBalance = async () => {
      const tokenbalance = await isAHolderOfToken({
        tokenAddress: project?.contractAddress as `0x${string}`,

        chain: Number(project?.chainId!),
      });
      if (tokenbalance) setTokenBalance(tokenbalance);
    };
    fetchUserTokenBalance();
  }, [project, address, user, userInfo]);

  return (
    <>
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
                    <Badge
                      key={index}
                      variant={"default"}
                      className="rounded-sm text-[18px] bg-transparent border border-primary text-primary"
                    >
                      {value}
                    </Badge>
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

                {(userInfo.wallets || address) &&
                  tokenBalance &&
                  tokenBalance > 0 && (
                    <Button
                      className="mt-4 w-full"
                      disabled={tokenBalance <= 0 || loader}
                      onClick={mintValues}
                      variant="secondary"
                    >
                      {loader ? "Minting..." : "Mint Values"}
                    </Button>
                  )}

                {!user && (
                  <Button
                    variant="secondary"
                    onClick={login}
                    className="w-full"
                  >
                    Login
                  </Button>
                )}

                {tokenBalance && tokenBalance <= 0 && (
                  <Alert className="my-8">
                    <WandSparklesIcon className="h-4 w-4" />
                    <AlertTitle className="leading-2">
                      You don&apos;t hold any{" "}
                      {project.category === "NFT" ? "NFT" : "tokens"} from this
                      project. You can connect a different wallet if you have it
                      there.
                    </AlertTitle>
                    <AlertDescription>
                      <Button
                        className="mt-2 w-full md:w-64"
                        variant="secondary"
                        onClick={() => disconnect()}
                      >
                        Disconnect Wallet
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                {tokenBalance && tokenBalance > 0 && (
                  <Alert className="my-8">
                    <RocketIcon className="h-4 w-4" />
                    <AlertTitle>
                      You hold {tokenBalance.toFixed(2)}{" "}
                      {project.category === "NFT" ? "NFT" : "tokens"} from this
                      project.
                    </AlertTitle>
                    <AlertDescription>
                      You can mint values for free.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </section>
          )}

          {loader && !project && (
            <div className="w-[90vw] m-auto flex flex-col gap-4">
              <Skeleton className="w-full h-[320px] rounded-md" />
              <Skeleton className="w-full m-auto h-[30px] rounded-md" />
              <Skeleton className="w-full m-auto h-[30px] rounded-md" />
            </div>
          )}
        </main>
      )}
    </>
  );
};

export default ProjectsPage;
