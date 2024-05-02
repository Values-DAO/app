import axios from "axios";

export default async function getNFTHolders(contractAddress: string) {
  const holders =
    await axios.get(`https://base-mainnet.g.alchemy.com/nft/v3/${process.env.ALCHEMY_BASE_KEY}/getOwnersForContract?contractAddress=${contractAddress}&withTokenBalances=false
`);

  return holders.data.owners;
}
