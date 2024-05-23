"use client";
import useValues from "@/app/hooks/useValues";
import {IUser} from "@/models/user";
import {IValuesData} from "@/types";
import {usePrivy} from "@privy-io/react-auth";
import {createContext, useContext, useEffect, useState} from "react";

interface UserContextType {
  userInfo: IUser | null;
  setUserInfo: (userInfo: IUser) => void;
  isLoading: boolean;
  valuesAvailable: IValuesData | null;
  setValuesAvailable: (values: IValuesData) => void;
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
  const [valuesAvailable, setValuesAvailable] = useState<IValuesData | null>(
    null
  );
  const [isLoading, setLoading] = useState(false);
  const {authenticated, user} = usePrivy();
  const {fetchUser, createUser, fetchFarcasterUserWallets, fetchAllValues} =
    useValues();
  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);

    const isUserExist = async () => {
      let userInfo: IUser | null | undefined = null;
      let wallets;

      if (user?.email?.address || user?.farcaster?.fid) {
        userInfo = (await fetchUser())?.user;
        console.log("userInfo", userInfo);
      }
      console.log("userInfo", userInfo);
      if (userInfo) {
        if (!userInfo?.generatedValues) {
          userInfo = {...userInfo, generatedValues: []};
        }

        setUserInfo(userInfo);
      } else {
        console.log("Creating user");
        wallets = await fetchFarcasterUserWallets();
        const userCreated = await createUser({wallets: wallets || []});
        console.log("userCreated", userCreated);
        setUserInfo(userCreated.user);
      }
    };
    setLoading(false);

    isUserExist();
  }, [user]);

  useEffect(() => {
    const fetchValues = async () => {
      const response = await fetchAllValues();

      setValuesAvailable(response.values);
    };
    fetchValues();
  }, []);

  return (
    <UserContext.Provider
      value={{
        userInfo,
        setUserInfo,
        isLoading,
        valuesAvailable,
        setValuesAvailable,
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
