"use client";
import GenerateNewValueCard from "@/components/generate-new-value-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ToastAction} from "@/components/ui/toast";
import {toast} from "@/components/ui/use-toast";
import ValuesWordCloud from "@/components/ui/values-word-cloud";
import {NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS} from "@/lib/constants";
import {IUser} from "@/models/user";
import {IValuesData} from "@/types";
import {usePrivy} from "@privy-io/react-auth";
import axios from "axios";
import {SearchIcon, Twitter} from "lucide-react";
import {useEffect, useState} from "react";
import {parseEther} from "viem";
import {privateKeyToAccount} from "viem/accounts";

import {
  useAccount,
  useChainId,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWalletClient,
  useWriteContract,
} from "wagmi";

const MintPage = () => {
  const [userData, setUserData] = useState<IUser>({} as IUser);
  const [availableValues, setAvailableValues] = useState<IValuesData>(
    {} as IValuesData
  );
  const [valueMinted, setValueMinted] = useState<{
    value: string;
    hash: string;
    showSuccessModal: boolean;
  }>();
  const [filteredData, setFilteredData] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});

  //Account Hooks
  const {user, linkWallet, login, ready, authenticated, linkEmail} = usePrivy();
  const {address, isConnected} = useAccount();
  const {data: signer} = useWalletClient();
  const chainId = useChainId();
  const {switchChain} = useSwitchChain();
  const {sendTransaction, data, isPending, error, status} =
    useSendTransaction();
  const {writeContractAsync} = useWriteContract();
  const {isSuccess: depositSuccess, isLoading} = useWaitForTransactionReceipt({
    hash: data,
  });
  const fetchUser = async () => {
    const response = await fetch(`/api/user?email=${user?.email?.address}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    setUserData(data.user);
  };

  const deposit = async () => {
    if (!user?.email || !address || !signer) return;
    console.log("chainId", chainId);
    if (chainId !== 84532) {
      toast({
        title: "Please switch to the Base Sepolia",
        variant: "destructive",
        action: (
          <ToastAction
            altText="switch"
            onClick={() => switchChain({chainId: 84532})}
          >
            Switch
          </ToastAction>
        ),
      });
      return;
    }
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      {
        headers: {
          accept: "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_COINGECKO_API_KEY,
        },
      }
    );

    if (!response.data.ethereum) return;
    const price = 10 / response.data.ethereum.usd;
    sendTransaction({
      to:
        (process.env.NEXT_PUBLIC_FUNDS_OWNER as `0x${string}`) ||
        "0xdF515f14270b2d48e52Ec1d34c1aB0D1889ca88A",
      value: parseEther(price.toString()),
      chainId: 84532,
    });
  };

  const mintValue = async ({value, key}: {value: any; key: string}) => {
    if (!value || !key || !user?.email?.address) return;

    if (userData?.balance > 0) {
      setLoading((prevLoading) => ({
        ...prevLoading,
        [key]: true,
      }));
      try {
        const hash = await writeContractAsync({
          abi: NFT_CONTRACT_ABI,
          address: NFT_CONTRACT_ADDRESS,
          functionName: "safeMint",
          args: [address, value.cid],
          account: privateKeyToAccount(
            process.env.NEXT_PUBLIC_ADMIN_WALLET_PRIVATE_KEY as `0x${string}`
          ),
          chainId: 84532,
        });

        // If hash is available, sleep for 5 seconds
        if (hash) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          setValueMinted({value: key, hash, showSuccessModal: true});
          await axios.post("/api/user", {
            method: "update",
            mintedValues: [
              {
                value: key,
                txHash: hash,
              },
            ],
            type: "sub",
            balance: 1,

            email: user?.email?.address,
          });

          fetchUser();
          toast({
            title: "We just dropped few NFTs to your wallet",
            description: "View them in your wallet",
            action: (
              <ToastAction
                altText="opensea"
                onClick={() => {
                  window.open(
                    `https://testnets.opensea.io/collection/iykyk-values-1`,
                    "_blank"
                  );
                }}
              >
                OpenSea
              </ToastAction>
            ),
          });
        } else {
          toast({
            title: "Failed to mint value",
            description: "Please try again",
          });
        }
      } catch (error) {
        toast({
          title: "Failed to mint value",
          description: "Please try again",
        });
      }

      setLoading((prevLoading) => ({
        ...prevLoading,
        [key]: false,
      }));
    } else {
      toast({
        title: "Deposit funds to mint",
        description: "You don't have enough funds to mint this value",
      });
    }
  };
  // filter values upon search by user and set it in a state to display in UI
  const hasMintedValue = async (value: string) => {
    if (
      !value ||
      !userData ||
      !userData.mintedValues ||
      userData.mintedValues.length === 0
    )
      return false;
    return userData.mintedValues.some(
      (obj: {value: string; txHash: string}) => obj.value === value
    );
  };
  const filteredDataPromises = Object.entries(availableValues)
    .filter(([key]) => key.includes(searchValue.toLowerCase()))
    .map(async ([key, value]) => {
      const hasMintedValueBefore = await hasMintedValue(key);
      return [key, {value, hasMintedValue: hasMintedValueBefore}];
    });
  const fetchData = async () => {
    const filteredData = Object.fromEntries(
      await Promise.all(filteredDataPromises)
    );
    setFilteredData(filteredData);
  };
  useEffect(() => {
    fetchData();
  }, [searchValue, userData]);

  useEffect(() => {
    if (!user?.email?.address) return;

    fetchUser();
  }, [user]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Failed to deposit funds",
        description: "Please try again",
      });
    }
  }, [error, status]);
  useEffect(() => {
    const fetchValues = async () => {
      const response = await axios.get("/api/value");

      if (response.data) setAvailableValues(response.data);
    };

    fetchValues();
  }, []);

  useEffect(() => {
    const updateUserbalance = async () => {
      if (depositSuccess) {
        const updatedUser = await axios.post("/api/user", {
          method: "update",
          balance: 10,
          type: "add",
          email: user?.email?.address,
        });
        setUserData((prevUserData) => ({
          ...prevUserData,
          balance: prevUserData.balance + 10,
        }));
      }
    };
    updateUserbalance();
  }, [depositSuccess]);
  return (
    <div className="flex justify-center">
      <div className="flex flex-col md:w-[900px] w-[98vw] max-w-[90%] m-auto">
        <ValuesWordCloud />
        <div className="flex flex-row justify-between items-center ">
          <p className="p-4">Balance: ${userData?.balance ?? 0}</p>
          <div>
            {isConnected ? (
              <Button
                onClick={deposit}
                disabled={isPending || isLoading}
                className=""
                variant={"link"}
              >
                {isPending ? (
                  <div className="flex flex-row justify-center items-center gap-2">
                    <span>Sign in wallet</span>
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-dashed border-white"></div>
                  </div>
                ) : isLoading ? (
                  <div className="flex flex-row justify-center items-center gap-2">
                    <span>Loading</span>
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-dashed border-white"></div>
                  </div>
                ) : (
                  <p> Deposit ($1 = 1 Value)</p>
                )}
              </Button>
            ) : (
              <Button variant="default" onClick={linkWallet}>
                Connect Wallet to deposit
              </Button>
            )}
          </div>
        </div>
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
        </div>{" "}
        {authenticated ? (
          <>
            {user?.email?.address ? (
              <section>
                {searchValue.length > 0 &&
                  filteredData &&
                  Object.entries(filteredData).map(
                    ([key, value]: [any, any]) => {
                      return (
                        <div
                          key={key}
                          className="w-full h-14 px-3 flex items-center hover:bg-gray-300/20 hover:cursor-pointer rounded-sm"
                        >
                          <span> {key}</span>

                          {isConnected ? (
                            <Button
                              variant="default"
                              className="ml-auto h-8 w-32"
                              disabled={value.hasMintedValue || loading[key]}
                              onClick={() => {
                                mintValue({value, key});
                              }}
                            >
                              {loading[key] ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-4 border-dashed border-white"></div>
                              ) : (
                                <>
                                  {" "}
                                  {value.hasMintedValue
                                    ? "Already Minted"
                                    : "Mint"}
                                </>
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
                    }
                  )}

                {searchValue.length > 0 &&
                  Object.entries(filteredData).length === 0 && (
                    <GenerateNewValueCard
                      value={searchValue}
                      mint={mintValue}
                    />
                  )}

                {searchValue.length === 0 && (
                  <div className="flex justify-center items-center p-4">
                    <span className="font-semibold  text-gray-300 text-lg">
                      Type out your values and mint them
                    </span>{" "}
                  </div>
                )}
              </section>
            ) : (
              <section className="md:w-[900px] pl-4 h-14  flex flex-row justify-between items-center hover:bg-gray-300/20 hover:cursor-pointer rounded-sm mt-4">
                <span className="font-semibold  text-gray-300 text-lg">
                  Link an email to proceed
                </span>{" "}
                <Button variant="default" onClick={linkEmail}>
                  Link Email
                </Button>
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
        {valueMinted && (
          <AlertDialog open={valueMinted.showSuccessModal}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  We just minted these values to your wallet.
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {valueMinted.value}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setValueMinted({...valueMinted, showSuccessModal: false});
                  }}
                >
                  Close
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    window.open(
                      `https://twitter.com/intent/tweet?text=${valueMinted.value}.%20iykyk`,
                      "_blank"
                    );
                  }}
                >
                  Tweet
                  <Twitter
                    strokeWidth={0}
                    fill="#1DA1F2"
                    className="h-6 w-6 ml-2"
                  />
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default MintPage;
