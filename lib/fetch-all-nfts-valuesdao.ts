import {NFT_CONTRACT_ADDRESS} from "@/constants";
import axios from "axios";

export const fetchAllNFTsValuesDAO = async (pageKey?: string) => {
  let url = `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.ALCHEMY_BASE_KEY}/getNFTsForContract?contractAddress=${NFT_CONTRACT_ADDRESS}&withMetadata=false`;

  if (pageKey) {
    url += `&pageKey=${pageKey}`;
  }

  const {data} = await axios.get(url);

  const count = data.nfts.length;

  if (data.pageKey) {
    // Call the API again with the new pageKey
    const totalCount: Number =
      count + (await fetchAllNFTsValuesDAO(data.pageKey));
    return totalCount;
  }

  return count;
};
