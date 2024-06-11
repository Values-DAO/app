import axios, {AxiosResponse} from "axios";

export async function fetchAndParseNFTsUser(address: string): Promise<void> {
  const config = {
    method: "get",
    url: `https://base-sepolia.g.alchemy.com/nft/v3/I2v38rq-wEvHA_YSSqIKJYo11ydCW2sY/getNFTsForOwner/?owner=${address}&pageSize=500`,
  };

  try {
    console.log("fetching NFTs for", address);
    const response: AxiosResponse = await axios(config);
    console.log("response", response);
    console.log(response.data);
  } catch (error) {
    console.error("error", error);
  }
}
