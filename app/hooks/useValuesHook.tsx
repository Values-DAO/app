import {createAttestation} from "@/lib/attestations";
import {supportedChainsMoralis} from "@/lib/constants";
import {IUser} from "@/models/user";
import {usePrivy} from "@privy-io/react-auth";
import axios from "axios";
import {gql, GraphQLClient} from "graphql-request";
import {useState} from "react";
import {useAccount} from "wagmi";

// Define the type for the current state
interface MintState {
  status: "idle" | "processing" | "minting" | "completed" | "error";
  data: any; // You can replace `any` with the actual data type you're expecting
  error: string | null;
}
type FarcasterSocialData = {
  Socials: {
    Social: {
      connectedAddresses: {
        address: string;
      }[];
    }[];
  };
};
const useValuesHook = () => {
  const [currentState, setCurrentState] = useState<MintState>({
    status: "idle",
    data: null,
    error: null,
  });
  const {user} = usePrivy();
  const {address} = useAccount();

  const fetchUser = async (): Promise<{
    user: IUser | null;
    message: string;
  }> => {
    if (!user?.email?.address && !user?.farcaster?.fid) {
      return {user: null, message: "No user data"};
    }

    const endpoint = user?.email?.address
      ? `/api/v2/user?email=${user?.email?.address}`
      : `/api/v2/user?fid=${user?.farcaster?.fid}`;

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
    twitter,
  }: {
    wallets?: string[];
    twitter?: string;
  }): Promise<{user: IUser | null; message: string}> => {
    if (!user?.email?.address && !user?.farcaster?.fid)
      return {user: null, message: "No user data"};

    try {
      const userCreated = await axios.post(
        `/api/v2/user`,
        {
          ...(user?.email?.address
            ? {email: user?.email?.address}
            : user?.farcaster?.fid
            ? {farcaster: user?.farcaster?.fid}
            : {}),

          wallets: wallets || [],
          method: "create_user",
          balance: 5,
          mintedValues: [],
          twitter,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
          },
        }
      );
      emailAnalytics({
        subject: "New User",
        body: [
          "A new user has been created with the following details:",
          user.email?.address ? `Email: ${user?.email?.address}` : "",
          user.farcaster?.displayName
            ? `Farcaster Display Name: ${user?.farcaster?.displayName}`
            : "",
          user.twitter?.username
            ? `Twitter Username: ${user?.twitter?.username}`
            : "",
          user?.farcaster?.username
            ? `Warpcast: https://warpcast.com/${user?.farcaster?.username}`
            : ``,
        ].join("\n"),
      });
      return {user: userCreated.data, message: "User created successfully"};
    } catch (error) {
      return {
        user: null,
        message: error as string,
      };
    }
  };

  const emailAnalytics = async ({
    subject,
    body,
  }: {
    subject: string;
    body: string;
  }) => {
    try {
      const response = await axios.post(
        "/api/v2/trigger-email",
        {
          body,
          subject,
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
  const fetchFarcasterUserWallets = async (): Promise<string[]> => {
    if (!user?.farcaster?.fid && !user?.email?.address) return [];

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

  const mintHandler = async ({
    values,
    type,
    communityId,
    wallets,
    description,
  }: {
    values: {
      name: string;
      weightage: string;
    }[];
    type?: string;
    communityId?: string;
    wallets?: string[];
    description?: string;
  }) => {
    try {
      const wallet = wallets as string[];
      const uid = await createAttestation(
        wallet[0] as string,
        values.map((value) => value.name),
        description as string
      );
      const payload = {
        ...(user?.email?.address
          ? {email: user.email.address}
          : user?.farcaster?.fid
          ? {farcaster: user.farcaster.fid}
          : {}),
        method: "update_profile",
        values,
        type,
        communityId,
        attestationUid: uid,
      };

      try {
        const {data} = await axios.post(`/api/v2/user`, payload, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
          },
        });

        if (data.status === 200) {
          emailAnalytics({
            subject: "User minted Value(s)",
            body: [
              "User minted Value(s)",
              user?.email?.address ? `Email: ${user?.email?.address}` : "",
              user?.farcaster?.displayName
                ? `Farcaster Display Name: ${user?.farcaster?.displayName}`
                : "",
              user?.farcaster?.username
                ? `Warpcast: https://warpcast.com/${user?.farcaster?.username}`
                : ``,

              `user Values minted: ${values
                .map((value) => value.name)
                .join(", ")}`,
            ].join("\n"),
          });
          return data;
        }
        return false;
      } catch (error) {
        console.error(error);
        return false;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  const fetchCommunityProjects = async ({id}: {id: string}) => {
    if (!id) return;
    try {
      const projectData = await axios.get(`/api/v2/community?id=${id}`, {
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

    const wallets = [
      ...new Set(
        [...(userInfo?.user?.wallets ?? []), address!]
          .filter((wallet) => wallet)
          .map((wallet) => wallet.toLowerCase())
      ),
    ];
    if (!wallets || !tokenAddress || !chain) return;

    let balance = 0;
    try {
      const balancePromises = wallets.map(async (wallet) => {
        if (!wallet) return 0;

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
        return response?.data[0]?.balance;
      });

      const balances = await Promise.all(balancePromises);
      const filteredBalances = balances.filter(
        (balance) => balance !== null && balance !== 0 && balance !== undefined
      );
      if (filteredBalances.length === 0) return 0;
      balance = filteredBalances.reduce(
        (acc, curr) => Number(acc) + Number(curr),
        0
      );

      return balance / 10 ** 18;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const analyseUserAndGenerateValues = async ({
    fid,
    twitter,
    method,
  }: {
    fid?: number;
    twitter?: string;
    method?: "refresh_values" | "generate_spectrum";
  }): Promise<{
    user: IUser | null;

    message: string;
    error?: string;
  }> => {
    const query =
      fid && twitter
        ? `fid=${fid}&twitter=${twitter}&twitter_userId=${user?.twitter?.subject}`
        : fid
        ? `fid=${fid}`
        : `twitter=${twitter}&twitter_userId=${user?.twitter?.subject}`;
    try {
      const response = await axios.get(
        `/api/v2/generate-user-value-spectrums?${query}&${
          method ? `method=${method}` : ""
        }`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
          },
        }
      );

      if (response.data.error) {
        return {
          user: null,

          message: response.data.error,
          error: response.data.error,
        };
      }

      emailAnalytics({
        subject: "New user generated their values using ai",
        body: [
          "user has generated their values using ai",
          user?.email?.address ? `Email: ${user?.email?.address}` : "",
          user?.farcaster?.displayName
            ? `Farcaster Display Name: ${user?.farcaster?.displayName}`
            : "",
          user?.farcaster?.username
            ? `Warpcast: https://warpcast.com/${user?.farcaster?.username}`
            : ``,
          `\nWarpcast values: ${JSON.stringify(
            response.data.user.aiGeneratedValuesWithWeights.warpcast
          )}\n`,
          `Twitter values: ${JSON.stringify(
            response.data.user.aiGeneratedValuesWithWeights.twitter
          )}\n`,

          `Warpcast Spectrum: ${response.data.user.spectrums.warpcast
            .map(
              (value: any) =>
                `${value.name}: ${value.description} (Score: ${value.score})\n`
            )
            .join("\n")}`,
          `Twitter Spectrum:${response.data.user.spectrums.twitter
            .map(
              (value: any) =>
                `${value.name}: ${value.description} (Score: ${value.score})\n`
            )
            .join("\n")}`,
        ].join("\n"),
      });
      return {
        user: response.data.user,
        message: response.data.error ?? "Values generated successfully",
      };
    } catch (error) {
      console.error(error);
      return {
        user: null,
        message: error as string,
        error: error as string,
      };
    }
  };

  return {
    currentState,
    fetchUser,
    createUser,
    fetchFarcasterUserWallets,
    mintHandler,
    fetchCommunityProjects,
    isAHolderOfToken,
    analyseUserAndGenerateValues,
  };
};

export default useValuesHook;
