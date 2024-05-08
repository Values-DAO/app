"use client";
import {toast} from "@/components/ui/use-toast";
import {IUser} from "@/models/user";
import {usePrivy} from "@privy-io/react-auth";
import {ToastAction} from "@radix-ui/react-toast";
import axios from "axios";
import {gql, GraphQLClient} from "graphql-request";

import {formatEther, parseEther} from "viem";
import Moralis from "moralis";
import {
  useAccount,
  useChainId,
  useSendTransaction,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import {IValuesData} from "@/types";
import {supportedChainsMoralis} from "@/lib/constants";
type FarcasterSocialData = {
  Socials: {
    Social: {
      connectedAddresses: {
        address: string;
      }[];
    }[];
  };
};
const useValues = () => {
  const {user} = usePrivy();
  const {address} = useAccount();
  const {data: signer} = useWalletClient();
  const chainId = useChainId();
  const {switchChain} = useSwitchChain();
  const {sendTransaction, data: depositTxhash, error} = useSendTransaction();

  const fetchUser = async (): Promise<{
    user: IUser | null;
    message: string;
  }> => {
    if (!user?.email?.address && !user?.farcaster?.fid) {
      return {user: null, message: "No user data"};
    }

    const endpoint = user?.email?.address
      ? `/api/user?email=${user?.email?.address}`
      : `/api/user?fid=${user?.farcaster?.fid}`;

    try {
      const {data} = await axios.get(endpoint, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      });

      if (data.status === 404) {
        return {user: null, message: "User not found"};
      }

      return {user: data.user, message: "User found"};
    } catch (error) {
      return {user: null, message: error as string};
    }
  };
  const createUser = async ({
    wallets,
  }: {
    wallets?: string[];
  }): Promise<{user: IUser | null; message: string}> => {
    if (!user?.email?.address && !user?.farcaster?.fid)
      return {user: null, message: "No user data"};

    try {
      const userCreated = await axios.post(
        `/api/user`,
        {
          ...(user?.email?.address
            ? {email: user?.email?.address}
            : {email: String(user?.farcaster?.fid)}),
          ...(user?.farcaster?.fid ? {farcaster: user?.farcaster?.fid} : {}),
          wallets: wallets || [],
          method: "create_user",
          balance: 5,
          mintedValues: [],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
          },
        }
      );
      return {user: userCreated.data, message: "User created successfully"};
    } catch (error) {
      return {
        user: null,
        message: error as string,
      };
    }
  };
  const updateUser = async ({
    values,
    balance,
    type,
  }: {
    values: {value: string; txHash: string}[];
    balance?: number;
    type?: string;
  }): Promise<{user: IUser | null; message: string}> => {
    if (!user?.email?.address && !user?.farcaster?.fid)
      return {user: null, message: "No user data"};

    try {
      const response = await axios.post(
        "/api/user",
        {
          method: "update",
          mintedValues: values,
          ...(balance && {balance}),
          ...(type && {type}),
          ...(user?.email?.address && {email: user?.email?.address}),
          ...(user?.farcaster?.fid && {farcaster: user?.farcaster?.fid}),
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
          },
        }
      );

      return {user: response.data, message: "User updated successfully"};
    } catch (error) {
      return {user: null, message: error as string};
    }
  };

  const createNewValue = async ({
    name,
    value,
    minters,
  }: {
    name: string;
    value: any;
    minters: string[];
  }): Promise<{
    value: IValuesData | null;
    message: string;
  }> => {
    if (!name || !value || !minters) return {value: null, message: "No data"};
    try {
      const response = await axios.post(
        "/api/value",
        {
          name,
          value,
          minters,
          method: "create",
          ...(user?.email?.address ? {email: user?.email?.address} : {}),
          ...(user?.farcaster?.fid ? {farcaster: user?.farcaster?.fid} : {}),
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
          },
        }
      );
      return {value: response.data, message: "Value created successfully"};
    } catch (error) {
      return {
        value: null,
        message: error as string,
      };
    }
  };
  const fetchAllValues = async (): Promise<{
    values: IValuesData;
    message: string;
  }> => {
    try {
      const response = await axios.get("/api/value", {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      });
      return {values: response.data, message: "Values fetched successfully"};
    } catch (error) {
      return {
        values: {},
        message: error as string,
      };
    }
  };
  const updateValue = async ({
    value,
  }: {
    value: string;
  }): Promise<{
    value: IValuesData | null;
    message: string;
  }> => {
    if (!user?.email?.address && !user?.farcaster?.fid)
      return {
        value: null,
        message: "No data",
      };

    try {
      const response = await axios.post(
        "/api/value",
        {
          value,
          ...(user?.email?.address ? {email: user?.email?.address} : {}),
          ...(user?.farcaster?.fid ? {farcaster: user?.farcaster?.fid} : {}),
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
          },
        }
      );
      return {value: response.data, message: "Value updated successfully"};
    } catch (error) {
      return {
        value: null,
        message: error as string,
      };
    }
  };

  const updateValuesBulk = async ({
    values,
  }: {
    values: string[];
  }): Promise<{
    values: IValuesData[] | null;
    message: string;
  }> => {
    if (!user?.email?.address && !user?.farcaster?.fid) {
      return {
        values: null,
        message: "No data",
      };
    }

    try {
      const response = await axios.post(
        "/api/value",
        {
          value: values,
          ...(user?.email?.address ? {email: user?.email?.address} : {}),
          ...(user?.farcaster?.fid ? {farcaster: user?.farcaster?.fid} : {}),
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
          },
        }
      );
      return {
        values: response.data.values,
        message: "Values updated successfully",
      };
    } catch (error) {
      return {
        values: null,
        message: error as string,
      };
    }
  };
  const validateInviteCode = async ({
    inviteCode,
  }: {
    inviteCode: string;
  }): Promise<{isValid: boolean; message: string; user: IUser | null}> => {
    if (!inviteCode) {
      return {isValid: false, message: "No invite code provided", user: null};
    }

    const endpoint = user?.email?.address
      ? `/api/validate-code?code=${inviteCode}&email=${user?.email?.address}`
      : `/api/validate-code?code=${inviteCode}&fid=${user?.farcaster?.fid}`;

    try {
      const response = await axios.get(endpoint, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      });

      const {isValid, user} = response.data;

      return {
        isValid,
        message: isValid ? "Code is valid" : "Code is invalid",
        user,
      };
    } catch (error) {
      return {isValid: false, message: error as string, user: null};
    }
  };

  const depositFunds = async ({email, fid}: {email?: string; fid?: string}) => {
    if (!address || !signer) return;
    if (!email && !fid) {
      console.log("Please provide an email or farcaster id");
      return;
    }

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

    const price = 10 / response.data.ethereum.usd;

    sendTransaction({
      to:
        (process.env.NEXT_PUBLIC_FUNDS_OWNER as `0x${string}`) ||
        "0xdF515f14270b2d48e52Ec1d34c1aB0D1889ca88A",
      value: parseEther(price.toString()),
      chainId: 84532,
      account: signer.account,
    });

    if (depositTxhash) return depositTxhash;
    if (error) return error;
    return;
  };

  const fetchFarcasterUserWallets = async (): Promise<string[]> => {
    if (!user?.farcaster?.fid) return [];

    const query = gql`
      query MyQuery {
        Socials(
          input: {
            filter: {userId: {_eq: "${user?.farcaster?.fid}"}, dappName: {_eq: farcaster}}
            blockchain: ethereum
          }
        ) {
          Social {
            connectedAddresses {
              address
            }
          }
        }
      }
    `;
    const url = "https://api.airstack.xyz/graphql";
    const graphQLClient = new GraphQLClient(url, {
      headers: {
        Authorization: process.env.NEXT_PUBLIC_AIRSTACK_API_KEY || "",
      },
    });

    try {
      const data: FarcasterSocialData = await graphQLClient.request(query);

      return data.Socials.Social[0].connectedAddresses.map(
        (address) => address.address
      );
    } catch (error) {
      return [];
    }
  };

  const addWallet = async ({
    wallets,
  }: {
    wallets: string[];
  }): Promise<{
    user: IUser | null;
    message: string;
  }> => {
    try {
      const response = await axios.post(
        "/api/user",
        {
          method: "add_wallet",
          wallets,
          ...(user?.farcaster?.fid ? {farcaster: user?.farcaster?.fid} : {}),
          ...(user?.email?.address ? {email: user?.email?.address} : {}),
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
          },
        }
      );
      return {user: response.data, message: "Wallet added successfully"};
    } catch (error) {
      return {
        user: null,
        message: error as string,
      };
    }
  };
  const fetchCommunityProjects = async ({id}: {id: string}) => {
    if (!id) return;
    try {
      const projectData = await axios.get(`/api/project?id=${id}`, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      });

      return projectData.data.project;
    } catch (error) {
      return error;
    }
  };

  const isAHolderOfToken = async ({
    tokenAddress,
    chain,
  }: {
    tokenAddress: string;
    chain: number;
  }) => {
    const userInfo = await fetchUser();

    const wallets = [...(userInfo?.user?.wallets ?? []), address!];
    if (!wallets || !tokenAddress || !chain) return;
    let balance = 0;
    try {
      for (const wallet of wallets) {
        if (!wallet) continue;
        const response = await axios.get(
          `https://deep-index.moralis.io/api/v2.2/${wallet}/erc20?chain=${
            supportedChainsMoralis[chain] ?? "eth"
          }&token_addresses%5B0%5D=${tokenAddress}`,
          {
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": process.env.NEXT_PUBLIC_MORALIS_API_KEY as string,
            },
          }
        );

        balance += response.data[0].balance;
      }
      return balance / 10 ** 18;
    } catch (e) {
      console.error(e);
      return 0;
    }
  };
  return {
    fetchUser,
    createUser,
    createNewValue,
    validateInviteCode,
    depositFunds,
    updateUser,
    updateValue,
    fetchAllValues,
    addWallet,
    fetchCommunityProjects,
    updateValuesBulk,
    isAHolderOfToken,
    fetchFarcasterUserWallets,
  };
};

export default useValues;
