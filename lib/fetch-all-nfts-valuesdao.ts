import {NFT_CONTRACT_ADDRESS} from "@/constants";
import axios from "axios";

export const fetchAllNFTsValuesDAO = async () => {
  const {data} = await axios.get(
    `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.ALCHEMY_BASE_KEY}/getNFTsForContract?contractAddress=${NFT_CONTRACT_ADDRESS}&withMetadata=false`
  );
  const count = data.nfts.length;
  return count;
};
