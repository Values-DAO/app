import {fetchAndParseNFTsUser} from "@/lib/fetch-and-parse-nfts-user";
import {useUserContext} from "@/providers/user-context-provider";
import React, {useEffect} from "react";

const ExperimentalBurnButtons = () => {
  const {userInfo} = useUserContext();
  console.log(userInfo?.wallets);
  const fetchNFTs = async () => {
    for (const wallet of userInfo?.wallets!) {
      await fetchAndParseNFTsUser(wallet);
    }
  };

  useEffect(() => {
    if (userInfo?.wallets) {
      fetchNFTs();
    }
  }, [userInfo?.wallets]);

  return <div></div>;
};

export default ExperimentalBurnButtons;
