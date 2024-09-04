import {NFT_CONTRACT_ADDRESS} from "@/constants";
import axios from "axios";

export const getTotalProfileNFTsMintedCount = async (pageKey?: string) => {
  let url = `https://base-${
    process.env.NEXT_PUBLIC_APP_ENV === "prod" ? "mainnet" : "sepolia"
  }.g.alchemy.com/nft/v3/${
    process.env.NEXT_PUBLIC_ALCHEMY_KEY
  }/getNFTsForContract?contractAddress=${NFT_CONTRACT_ADDRESS}&withMetadata=false`;

  if (pageKey) {
    url += `&pageKey=${pageKey}`;
  }

  const {data} = await axios.get(url);

  const count = data.nfts.length;

  if (data.pageKey) {
    // Call the API again with the new pageKey
    const totalCount: Number =
      count + (await getTotalProfileNFTsMintedCount(data.pageKey));
    return totalCount;
  }

  return count;
};
