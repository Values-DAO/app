"use client";
import useValuesHook from "@/hooks/useValuesHook";
import {getUserFarcasterWallets} from "@/lib/get-user-farcaster-wallets";
import {IUser} from "@/types";
import {usePrivy} from "@privy-io/react-auth";
import {createContext, useContext, useEffect, useState} from "react";

interface IUserContext {
  userInfo: IUser | null;
  setUserInfo: (userInfo: IUser | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<IUserContext>({
  userInfo: null,
  setUserInfo: () => {},
  isLoading: false,
});

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {authenticated, user, ready} = usePrivy();
  const {getUserData, createUser, addWallet} = useValuesHook();

  // usePrivy's user object will have either farcaster or email as shown in the modal on frontend

  // This effect runs when the user object changes, and it checks if the user is authenticated and whether user information already exists.
  // If the user is authenticated but doesn't have an existing userId, it fetches user data using getUserData
  // It basically updates the userInfo state with the user data fetched from the backend

  useEffect(() => {
    const userExists = async () => {
      if (!authenticated) return;
      if (userInfo?.userId) return;
      if (user?.farcaster?.fid || user?.email?.address) {
        setIsLoading(true);
        const userData = await getUserData({
          ...(user?.farcaster?.fid && {fid: user?.farcaster?.fid}),
          ...(user?.email?.address && {email: user?.email?.address}),
        });
        if ("error" in userData) {
          if (userData.error === "User not found") {
            // user does not exist, create user
            const newUser = await createUser({
              ...(user?.farcaster?.fid && {fid: user?.farcaster?.fid}),
              ...(user?.email?.address && {email: user?.email?.address}),
            });

            if ("error" in newUser) {
              console.error("Error creating user:", newUser.error);
            } else {
              setUserInfo(newUser);
            }
          }
        } else {
          setUserInfo(userData);
        }
        setIsLoading(false);
      }
      return;
    };
    userExists();
  }, [user]);

  // This effect checks if the user has any wallets. If not, it fetches the user's Farcaster wallets and adds the first one to the user's profile

  useEffect(() => {
    const updateUserWalletsIfNotExists = async () => {
      if (!userInfo) return;
      if (userInfo.wallets.length === 0) {
        if (!user?.farcaster?.fid) return;
        const userFarcasterWallets = await getUserFarcasterWallets(
          user?.farcaster?.fid
        );

        if (userFarcasterWallets.length === 0) return;

        const updatedUser = await addWallet({
          userId: userInfo.userId,
          walletAddress: userFarcasterWallets[0],
        });

        if ("error" in updatedUser) {
          console.error(updatedUser.error);
        } else {
          setUserInfo(updatedUser);
        }
      }
    };
    updateUserWalletsIfNotExists();
  }, [user, userInfo]);

  return (
    <UserContext.Provider value={{userInfo, setUserInfo, isLoading}}>
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