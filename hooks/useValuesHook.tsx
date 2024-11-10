import { API_BASE_URL} from "@/constants";
import { IUser, UserData} from "@/types";
import axios from "axios";

// This hook contains multiple async functions to interact with the backend APIs.

const useValuesHook = () => {
  // Fetches a list of all Values from /values endpoint in the backend. Returns an array of objects containing name, valueId and mintersCount.
  // mintersCount is the number of users who have minted this particular Value
  // Error Handling: Refactored.
  // This is only used in word cloud component which is no longer used in the app.
  const getAllValues = async (): Promise<
    {
      name: string;
      valueId: string;
      mintersCount: number;
    }[]
  > => {
    const {data} = await axios.get(`${API_BASE_URL}/values`);

    if (data.error) {
      return [];
    }

    return data;
  };

  // Fetches user data based on userId, fid (farcaster id) or email.
  // Returns an object containing user data as an IUser object or an error object
  // Error Handling: Refactored.
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
      const {data} = await axios.get(`${API_BASE_URL}/users/${userId}`);
      return data;
    }
    if (fid) {
      const {data} = await axios.get(`${API_BASE_URL}/users?fid=${fid}`);
      return data;
    } else if (email) {
      const {data} = await axios.get(`${API_BASE_URL}/users?email=${email}`);
      return data;
    }

    return {error: "Please provide either userId, fid or email"};
  };

  // Creates a new user based on either fid or email.
  const createUser = async ({
    fid,
    farcasterUsername,
    email,
  }: {
    fid?: number;
    farcasterUsername?: string;
    email?: string;
  }): Promise<{error: string} | IUser> => {
    if (fid) {
      const {data} = await axios.post(`${API_BASE_URL}/users`, {
        fid,
        farcasterUsername,
        method: "create_user",
        referrer: "app.valuesdao.io",
      });
      return data;
    }
    if (email) {
      const {data} = await axios.post(`${API_BASE_URL}/users`, {
        email,
        method: "create_user",
        referrer: "app.valuesdao.io",
      });
      return data;
    }
    return {error: "Please provide either fid or email"};
  };

  // Adds a wallet address to the user's profile and returns the updated user object/
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
    const {data} = await axios.post(`${API_BASE_URL}/users`, {
      userId,
      method: "add_wallet",
      userDataToUpdate: {
        wallet: walletAddress,
      },
    });
    return data;
  };

  // Error Handling: Refactored.
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
      return {
        error: "Please provide userId and source.",
      };
    }

    if (source === "farcaster" && farcaster && farcaster.fid) {
      const {data} = await axios.post(`${API_BASE_URL}/generate/values`, {
        userId,
        source,
        farcaster: {fid: farcaster.fid},
      });

      if (data.error) {
        return {
          error: data.message,
        };
      }

      // ! change this to data instead of data.user if it's not working
      return data.user;
    } else if (
      source === "twitter" &&
      twitter &&
      twitter.id &&
      twitter.username
    ) {
      try {
        const {data} = await axios.post(`${API_BASE_URL}/generate/values`, {
          userId,
          source,
          twitter: {id: twitter.id, username: twitter.username},
        });

        if (data.error) {
          return {
            error: data.message,
          };
        }

        return data.user;
      } catch (error) {
        return {
          error: "Error generating values.",
        };
      }
    }

    return {
      error: "Invalid source."
    };
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
    const {data} = await axios.post(`${API_BASE_URL}/users`, {
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
    const {data} = await axios.post(`${API_BASE_URL}/users`, {
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
    farcasterUsername,
  }: {
    userId: string;
    fid: number;
    farcasterUsername: string;
  }): Promise<{error: string} | IUser> => {
    if (!userId || !fid) {
      return {error: "Please provide userId and fid"};
    }
    const {data} = await axios.post(`${API_BASE_URL}/users`, {
      userId,
      method: "link_farcaster",
      userDataToUpdate: {
        fid,
        farcasterUsername
      },
    });
    if (data.error) {
      return {error: data.error};
    }
    return data;
  };

  const getFarcasterUserName = async ({
                                        fid,
                                      }: {
    fid: number;
  }): Promise<Object> => {
    if (!fid) {
      return {error: "Please provide fid"};
    }

    const response = await axios.get(`${API_BASE_URL}/farcaster/user?fid=${fid}`);

    return response.data;
  };

  const searchFarcasterUser = async ({
                                       username,
                                     }: {
    username: string;
  }): Promise<{username: string; fid: string}[] | {error: any}> => {
    try {
      const {data} = await axios.get(`${API_BASE_URL}/farcaster/search?username=${username}`);

      if (data.error) {
        return {error: data.error};
      }

      return data
    } catch (error) {
      return {error: error};
    }
  };

  const searchAllUsers = async ({username}: {username: string;}): Promise<{username: string; fid: string}[] | {error: any}> => {
    try {
      const {data} = await axios.get(`${API_BASE_URL}/searchUsers?username=${username}`);

      if (data.error) {
        return {error: data.error};
      }

      return data
    } catch (error) {
      return {error: error};
    }
  };

  const getAlignment = async ({viewer, target}: {viewer: string; target: string}): Promise<{error: string} | {alignment: {alignmentScore: number, viewerInfo: UserData, targetInfo: UserData}}> => {
    console.log("HERE")
    const {data} = await axios.get(`${API_BASE_URL}/users/get-alignment?viewer=${viewer}&target=${target}`);
    console.log("DATA: ", data)
    if (data.error) {
      return {error: data.message};
    }

    return data
  }


  return {
    getAllValues,
    getUserData,
    createUser,
    addWallet,
    generateValues,
    attachTwitter,
    mintValues,
    attachFarcaster,
    getFarcasterUserName,
    getAlignment,
    searchFarcasterUser,
    searchAllUsers
  };
};

export default useValuesHook;