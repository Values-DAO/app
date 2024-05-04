"use client";
import {toast} from "@/components/ui/use-toast";
import {IUser} from "@/models/user";
import {usePrivy} from "@privy-io/react-auth";
import {ToastAction} from "@radix-ui/react-toast";
import axios from "axios";
import {gql, GraphQLClient} from "graphql-request";
import {useEffect, useState} from "react";
import {parseEther} from "viem";
import {
  useAccount,
  useChainId,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWalletClient,
} from "wagmi";
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
  const [isUserExist, setIsUserExist] = useState(false);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<IUser>({} as IUser);
  const {user, authenticated} = usePrivy();
  const {address} = useAccount();
  const {data: signer} = useWalletClient();
  const chainId = useChainId();
  const {switchChain} = useSwitchChain();
  const {sendTransaction, data: depositTxhash, error} = useSendTransaction();

  useEffect(() => {
    if (!authenticated) return;
    const isUserExist = async () => {
      setIsLoading(true);

      if (user?.farcaster?.fid) {
        const userInfo: IUser | null | undefined = await fetchUser({
          fid: user?.farcaster?.fid,
        });
        const wallets = await fetchFarcasterUserWallets();
        if (userInfo) {
          setUserInfo(userInfo);
          setIsUserExist(true);
        }

        if (userInfo?.isVerified) {
          setIsUserVerified(true);
        }
        if (userInfo === null) {
          await createUser({wallets: wallets});
        }
      }
      if (user?.email) {
        const userInfo: IUser | null | undefined = await fetchUser({
          email: user?.email?.address,
        });

        if (userInfo) {
          setUserInfo(userInfo);
          setIsUserExist(true);
        }

        if (userInfo?.isVerified) {
          setIsUserVerified(true);
        }
        if (userInfo === null) {
          await createUser();
        }
      }
      setIsLoading(false);
    };
    isUserExist();
  }, [user]);

  const fetchUser = async ({
    email,
    fid,
  }: {
    email?: string;
    fid?: number;
  }): Promise<IUser | null | undefined> => {
    if (!email && !fid) return undefined;

    if (email) {
      const user = await axios.get(`/api/user?email=${email}`, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      });
      if (user.data.status === 404) {
        return null;
      }
      return user.data.user;
    }
    if (fid) {
      const user = await axios.get(`/api/user?fid=${fid}`, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      });
      if (user.data.status === 404) {
        return null;
      }

      return user.data.user;
    }
    return null;
  };
  const createUser = async ({wallets}: {wallets?: string[]}) => {
    if (!user?.email?.address && !user?.farcaster?.fid) return;

    try {
      const userCreated = await axios.post(
        `/api/user`,
        {
          ...(user?.email?.address ? {email: user?.email?.address} : {}),
          ...(user?.farcaster?.fid ? {farcaster: user?.farcaster?.fid} : {}),
          wallets: wallets || [],
          method: "create_user",
          balance: 5,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
          },
        }
      );
      return user;
    } catch (error) {
      return error;
    }
  };
  const updateUser = async ({
    value,
    hash,
    balance,
    type,
  }: {
    value: string;
    hash: string;
    balance: number;
    type: string;
  }) => {
    try {
      const response = await axios.post(
        "/api/user",
        {
          method: "update",
          mintedValues: [
            {
              value,
              txHash: hash,
            },
          ],
          type,
          balance,

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

      return response.data;
    } catch (error) {
      return error;
    }
  };
  const fetchAllValues = async () => {
    try {
      const response = await axios.get("/api/value", {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      });
      return response.data;
    } catch (error) {
      return error;
    }
  };
  const updateValue = async ({value}: {value: string}) => {
    if (!user?.email?.address && !user?.farcaster?.fid) return;

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
      return response.data;
    } catch (error) {
      return error;
    }
  };
  const validateInviteCode = async ({inviteCode}: {inviteCode: string}) => {
    if (!inviteCode) return false;
    if (user?.email?.address) {
      const response = await axios.get(
        `/api/validate-code?code=${inviteCode}&email=${user?.email?.address}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
          },
        }
      );

      const {isValid} = response.data;
      setIsUserVerified(isValid);
      return isValid;
    }
    if (user?.farcaster?.fid) {
      const response = await axios.get(
        `/api/validate-code?code=${inviteCode}&fid=${user?.farcaster?.fid}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
          },
        }
      );

      const {isValid} = response.data;
      setIsUserVerified(isValid);

      return isValid;
    }
    return false;
  };

  const deposiFunds = async ({email, fid}: {email?: string; fid?: string}) => {
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

  const fetchFarcasterUserWallets = async () => {
    if (!user?.farcaster?.fid) return;

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

  const addWallet = async ({wallets}: {wallets: string[]}) => {
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
      return response.data;
    } catch (error) {
      return error;
    }
  };

  return {
    fetchUser,
    createUser,
    isUserExist,
    isUserVerified,
    setIsUserExist,
    setIsUserVerified,
    userInfo,
    setUserInfo,
    isLoading,
    validateInviteCode,
    deposiFunds,
    updateUser,
    updateValue,
    fetchAllValues,
    addWallet,
  };
};

export default useValues;
