"use client";
import React, {useEffect, useState} from "react";
import axios from "axios";
import Image from "next/image";
import {Badge} from "@/components/ui/badge";
import {IProject} from "@/models/project";
import {Button} from "@/components/ui/button";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
} from "wagmi";

import {erc20Abi} from "viem";
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

interface pageProps {
  params: {id: string};
}

const ProjectsPage: React.FC<pageProps> = ({params}) => {
  const {user, login, authenticated, linkWallet, linkEmail} = usePrivy();
  const {address} = useAccount();
  const {disconnect} = useDisconnect();
  const {writeContractAsync, isError, failureReason} = useWriteContract();
  const [project, setProject] = useState<IProject | null>(null);

  const [valuesFromDB, setValuesFromDB] = useState<any>([]);

  const [loader, setLoader] = useState(false);
  const id = params.id.split("-").pop();
  const [isUserVerified, setIsUserVerified] = useState(false);
  const {data: userBalanceOfToken} = useReadContract({
    abi: erc20Abi,
    address: project?.contractAddress! as `0x${string}`,
    functionName: "balanceOf",
    args: [address!],
    chainId: Number(project?.chainId!),
  });

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoader(true);
      const projectData = await axios.get(`/api/project?id=${id}`, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      });
      if (projectData.data.status === 200) setProject(projectData.data.project);
      setLoader(false);
    };
    fetchProjectData();
  }, []);

  useEffect(() => {
    const fetchValuesFromDB = async () => {
      const values = await axios.get(`/api/value`, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      });

      setValuesFromDB(values.data);
    };
    fetchValuesFromDB();
  }, []);
  useEffect(() => {
    if (!user?.email?.address) return;

    const isUserExist = async () => {
      if (authenticated) {
        const existingUser = await fetch(
          `/api/user?email=${user?.email?.address}`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
            },
          }
        );
        const data = await existingUser.json();

        if (data?.user?.isVerified) {
          setIsUserVerified(true);
        }
        if (data.status === 404) {
          await fetch(`/api/user`, {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
            },

            body: JSON.stringify({
              email: user?.email?.address,
              wallets: [],
              method: "create_user",
              balance: 5,
            }),
          });
        }
      }
    };
    isUserExist();
  }, [user?.email?.address, authenticated, user]);
  const mintValues = async () => {
    setLoader(true);

    const cidsToMint = [];
    const valuesMinted = [];
    if (project?.values)
      for (const value of project?.values) {
        const existingValue = valuesFromDB[value.toLowerCase()];

        if (existingValue) {
          if (existingValue.minters?.includes(user?.email?.address)) {
            console.log("Already minted");
            continue;
          }

          cidsToMint.push(existingValue.cid);
          valuesMinted.push(value.toLowerCase());
        }
      }
    const hash = await writeContractAsync({
      abi: NFT_CONTRACT_ABI,
      address: NFT_CONTRACT_ADDRESS,
      functionName: "batchMint",
      args: [address, cidsToMint],
      account: privateKeyToAccount(
        process.env.NEXT_PUBLIC_ADMIN_WALLET_PRIVATE_KEY as `0x${string}`
      ),
      chainId: 84532,
    });

    await axios.post(
      "/api/user",
      {
        method: "update",
        mintedValues: valuesMinted.map((value) => {
          return {value: value, txHash: hash};
        }),
        email: user?.email?.address,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      }
    );

    await axios.post(
      "/api/value",
      {
        email: user?.email?.address,
        value: valuesMinted,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      }
    );
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

  return (
    <>
      {isUserVerified ? (
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
                      className="rounded-sm text-[18px] "
                    >
                      {value}
                    </Badge>
                  ))}
                </div>

                {user?.email?.address && !address && (
                  <Button
                    variant="secondary"
                    onClick={linkWallet}
                    className="w-full"
                  >
                    Connect Wallet
                  </Button>
                )}

                {user?.email?.address &&
                  address &&
                  Number(userBalanceOfToken) > 0 && (
                    <Button
                      className="mt-4 w-full"
                      disabled={Number(userBalanceOfToken) <= 0 || loader}
                      onClick={mintValues}
                      variant="secondary"
                    >
                      {loader ? "Minting..." : "Mint Values"}
                    </Button>
                  )}

                {user && !user?.email?.address && (
                  <Button
                    variant="secondary"
                    onClick={linkEmail}
                    className="w-full"
                  >
                    Link Email
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

                {user && address && Number(userBalanceOfToken) <= 0 && (
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
                {user && address && Number(userBalanceOfToken) > 0 && (
                  <Alert className="my-8">
                    <RocketIcon className="h-4 w-4" />
                    <AlertTitle>
                      You hold {Number(userBalanceOfToken).toFixed()}{" "}
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
      ) : (
        <div className="flex flex-col items-center px-6 mt-[40%] md:mt-[15%]">
          <InviteCodeModal setVerified={setIsUserVerified} />
        </div>
      )}
    </>
  );
};

export default ProjectsPage;
