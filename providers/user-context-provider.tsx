"use client";

import useValuesHook from "@/app/hooks/useValuesHook";
import {IUser} from "@/models/user";
import {usePrivy} from "@privy-io/react-auth";
import axios from "axios";
import {createContext, useContext, useEffect, useState} from "react";

interface UserContextType {
  userInfo: IUser | null;
  setUserInfo: (userInfo: IUser) => void;
  isLoading: boolean;
  valuesRecommendation: string[];
}
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [isLoading, setLoading] = useState(false);
  const {authenticated, user} = usePrivy();
  const [values, setValues] = useState([]);
  const {fetchUser, createUser, fetchFarcasterUserWallets} = useValuesHook();
  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);

    const isUserExist = async () => {
      let userInfo: IUser | null | undefined = null;
      let wallets;
      setLoading(true);
      if (!user?.email?.address && !user?.farcaster?.fid) {
        setLoading(false);
        return;
      }
      userInfo = (await fetchUser())?.user;

      if (userInfo) {
        setUserInfo(userInfo);
      } else {
        const wallets = await fetchFarcasterUserWallets();

        const userCreated = await createUser({
          wallets:
            [
              ...new Set(
                wallets
                  .filter((wallet) => wallet)
                  .map((wallet) => wallet.toLowerCase())
              ),
              ...(user?.wallet?.address
                ? [user.wallet.address.toLowerCase()]
                : []),
            ] || [],
          twitter: user?.twitter?.username as string,
        });

        setUserInfo(userCreated.user);
      }

      setLoading(false);
    };

    isUserExist();
  }, [user]);

  useEffect(() => {
    const addWalletsIfPresent = async () => {
      if (!user) return;
      try {
        const wallets = await fetchFarcasterUserWallets();

        const response = await axios.post(
          "/api/v2/user",
          {
            method: "add_wallet",
            wallets: [user?.wallet?.address, ...wallets],
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
      } catch (error) {
        console.log("error", error);
      }
    };

    const updatetwitterHandle = async () => {
      if (!user || !user?.twitter?.username) return;
      try {
        if (userInfo?.twitter) return;
        const response = await axios.post(
          "/api/v2/user",
          {
            method: "update_twitter",
            twitter: user?.twitter?.username,
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
      } catch (error) {
        console.log("error", error);
      }
    };

    const updateWarpcastHandle = async () => {
      if (!user || !user?.farcaster?.fid) return;
      try {
        if (userInfo?.farcaster) return;
        const response = await axios.post(
          "/api/v2/user",
          {
            method: "update_farcaster",

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
      } catch (error) {
        console.log("error", error);
      }
    };
    updatetwitterHandle();
    updateWarpcastHandle();
    addWalletsIfPresent();
  }, [user]);

  useEffect(() => {
    const getAllValues = async () => {
      //basically value recommendations array
      const {
        data: {values},
      } = await axios.get(`${process.env.NEXT_PUBLIC_HOST}/api/v2/value`);

      setValues(values);
    };

    getAllValues();
  }, []);

  return (
    <UserContext.Provider
      value={{
        userInfo,
        setUserInfo,
        isLoading,
        valuesRecommendation: values,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};
