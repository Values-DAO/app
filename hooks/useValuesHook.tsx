import {AIRSTACK_API_URL} from "@/constants";
import {getFarcasterUser} from "@/lib/get-farcaster-user";
import {FarcasterSearchUserType, IUser} from "@/types";
import axios from "axios";
import {GraphQLClient} from "graphql-request";

const useValuesHook = () => {
  const getAllValues = async (): Promise<
    {
      name: string;
      valueId: string;
      mintersCount: number;
    }[]
  > => {
    const {data} = await axios.get("/api/values");
    return data;
  };
  const getUserData = async ({
    userId,
    fid,
    email,
  }: {
    userId?: string;
    fid?: number;
    email?: string;
  }): Promise<{error: string} | IUser> => {
    if (userId) {
      const {data} = await axios.get(`/api/users/${userId}`);
      return data;
    }
    if (fid) {
      const {data} = await axios.get(`/api/users?fid=${fid}`);
      return data;
    } else if (email) {
      const {data} = await axios.get(`/api/users?email=${email}`);
      return data;
    }
    return {error: "Please provide either userId, fid or email"};
  };

  const createUser = async ({
    fid,
    email,
  }: {
    fid?: number;
    email?: string;
  }): Promise<{error: string} | IUser> => {
    if (fid) {
      const {data} = await axios.post("/api/users", {
        fid,
        method: "create_user",
        referrer: "app.valuesdao.io",
      });
      return data;
    }
    if (email) {
      const {data} = await axios.post("/api/users", {
        email,
        method: "create_user",
        referrer: "app.valuesdao.io",
      });
      return data;
    }
    return {error: "Please provide either fid or email"};
  };

  const addWallet = async ({
    userId,
    walletAddress,
  }: {
    userId: string;
    walletAddress: string;
  }): Promise<{error: string} | IUser> => {
    if (!userId || !walletAddress) {
      return {error: "Please provide userId and walletAddress"};
    }
    const {data} = await axios.post(`/api/users`, {
      userId,
      method: "add_wallet",
      userDataToUpdate: {
        wallet: walletAddress,
      },
    });
    return data;
  };

  const generateValues = async ({
    source,
    userId,
    farcaster,
    twitter,
  }: {
    userId: string;
    source: "farcaster" | "twitter";
    farcaster?: {fid: number};
    twitter?: {id: string; username: string};
  }): Promise<{error: string} | IUser> => {
    if (!userId || !source) {
      return {error: "Please provide userId and source"};
    }

    if (source === "farcaster" && farcaster && farcaster.fid) {
      const {data} = await axios.post(`/api/generate/values`, {
        userId,
        source,
        farcaster: {fid: farcaster.fid},
      });
      return data;
    } else if (
      source === "twitter" &&
      twitter &&
      twitter.id &&
      twitter.username
    ) {
      try {
        const {data} = await axios.post(`/api/generate/values`, {
          userId,
          source,
          twitter: {id: twitter.id, username: twitter.username},
        });
        if (data.error) {
          return {
            error: data.error,
          };
        }
        return data.user;
      } catch (error) {
        return {
          error: "Error generating values",
        };
      }
    }
    return {error: "Invalid source"};
  };

  //todo mint Wallet, add farcaster, add twitter

  const attachTwitter = async ({
    userId,
    username,
    id,
  }: {
    userId: string;
    username: string;
    id: string;
  }): Promise<{error: string} | IUser> => {
    if (!userId || !username || !id) {
      return {error: "Please provide userId, username and id"};
    }
    const {data} = await axios.post(`/api/users`, {
      userId,
      method: "link_twitter",
      userDataToUpdate: {
        twitterUsername: username,
        twitterId: id,
      },
    });

    if (data.error) {
      return {error: data.error};
    }
    return data;
  };

  const mintValues = async ({
    userId,
    values,
    source,
  }: {
    userId: string;
    values: string[];
    source: "twitter" | "warpcast";
  }): Promise<{error: string} | IUser> => {
    if (!userId || !values || values.length === 0) {
      return {error: "Please provide userId and values"};
    }
    const {data} = await axios.post(`/api/users`, {
      userId,
      method: "mint_values",
      userDataToUpdate: {
        values: values.map((value) => value.toLowerCase()),
      },
      sourceMintedValues: source,
    });
    if (data.error) {
      return {error: data.error};
    }
    return data;
  };

  const attachFarcaster = async ({
    userId,
    fid,
  }: {
    userId: string;
    fid: number;
  }): Promise<{error: string} | IUser> => {
    if (!userId || !fid) {
      return {error: "Please provide userId and fid"};
    }
    const {data} = await axios.post(`/api/users`, {
      userId,
      method: "link_farcaster",
      userDataToUpdate: {
        fid,
      },
    });
    if (data.error) {
      return {error: data.error};
    }
    return data;
  };

  const getFarcaterUserName = async ({fid}: {fid: number}): Promise<Object> => {
    if (!fid) {
      return {error: "Please provide fid"};
    }
    const response = await getFarcasterUser(fid);

    return response;
  };

  const getAlignmentScore = async ({
    fid,
    viewerFid,
  }: {
    fid: number;
    viewerFid: number;
  }): Promise<{error: string} | {alignmentScore: string}> => {
    const {data} = await axios.get(
      `/api/users/alignment-score?fid=${viewerFid}&targetFid=${fid}`
    );

    if ("error" in data) {
      return {error: data.error};
    }

    return data;
  };

  const searchFarcasterUser = async ({
    username,
  }: {
    username: string;
  }): Promise<{username: string; fid: string}[] | {error: any}> => {
    const query = `query SearchFarcasterUser {
        Socials(
          input: {filter: {profileName: {_regex: "${username}"}}, blockchain: ethereum, limit: 10, order: {farRank: ASC}}
        ) {
          Social {
            fid: userId
            username:profileName
          }
        }
      }`;

    const graphQLClient = new GraphQLClient(AIRSTACK_API_URL, {
      headers: {
        Authorization: process.env.NEXT_PUBLIC_AIRSTACK_API_KEY || "",
      },
    });

    try {
      const data: FarcasterSearchUserType = await graphQLClient.request(query);

      return data.Socials.Social;
    } catch (error) {
      return {error: error};
    }
  };
  return {
    getAllValues,
    getUserData,
    createUser,
    addWallet,
    generateValues,
    attachTwitter,
    mintValues,
    attachFarcaster,
    getFarcaterUserName,
    getAlignmentScore,
    searchFarcasterUser,
  };
};

export default useValuesHook;
