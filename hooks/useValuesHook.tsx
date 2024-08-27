import {IUser} from "@/types";
import axios from "axios";

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

  return {
    getAllValues,
    getUserData,
    createUser,
    addWallet,
    generateValues,
    attachTwitter,
    mintValues,
  };
};

export default useValuesHook;
