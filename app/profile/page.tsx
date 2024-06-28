"use client";

import {usePrivy} from "@privy-io/react-auth";
import {useUserContext} from "@/providers/user-context-provider";
import {Button} from "@/components/ui/button";
import ValueBadge from "@/components/ui/value-badge";
import {useEffect, useState} from "react";
import useValuesHook from "../hooks/useValuesHook";
import {NFT_CONTRACT_ADDRESS} from "@/constants";
const ProfilePage = () => {
  const {authenticated, login, ready, user} = usePrivy();
  const {userInfo, isLoading, setUserInfo} = useUserContext();

  const {fetchUser} = useValuesHook();
  useEffect(() => {
    const fetchUserData = async () => {
      const user = (await fetchUser()).user;
      if (user) setUserInfo(user);
    };

    fetchUserData();
  }, [user]);

  return (
    <div className="p-4">
      {authenticated && userInfo && !isLoading && (
        <div>
          <h2 className="scroll-m-20 text-center border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-muted-foreground mb-2">
            || profile
          </h2>

          <div>
            <h3>
              <span className="font-semibold">Hello</span>{" "}
              {user?.farcaster?.displayName}
            </h3>
            <h3>
              <span className="font-semibold">View your Profile NFT</span>
              <Button variant="link" className="text-lg font-bold" asChild>
                <a
                  href={`https://testnets.opensea.io/assets/base-sepolia/${NFT_CONTRACT_ADDRESS}/${userInfo.profileNft}`}
                  target="_blank"
                >
                  on OpenSea
                </a>
              </Button>
            </h3>
            <div className="flex flex-wrap flex-row gap-2 my-4 font-medium">
              {userInfo.mintedValues &&
                userInfo.mintedValues.map((value) => (
                  <ValueBadge
                    key={value.value}
                    value={value.value}
                    weight={value.weightage!.toString()}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
      {ready && !authenticated && (
        <section className="w-full mt-24  flex flex-col items-center ">
          <span className="scroll-m-20 text-lg font-semibold tracking-tight ">
            Login to view your profile
          </span>
          <Button
            variant="default"
            onClick={login}
            disabled={!ready || authenticated || isLoading}
            className="my-4"
          >
            {isLoading ? "Loading.." : "Login"}
          </Button>
        </section>
      )}
      {!ready ||
        (isLoading && (
          <section className="w-full mt-24  flex flex-col items-center ">
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
              <span>Loading</span>
            </div>
          </section>
        ))}
    </div>
  );
};

export default ProfilePage;
