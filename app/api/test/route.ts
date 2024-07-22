import {supportedChainsMoralis} from "@/lib/constants";
import User from "@/models/user";
import axios from "axios";
import {NextRequest, NextResponse} from "next/server";

export default async function POST(req: NextRequest, res: NextResponse) {
  const {tokenAddress, chain, type, fid} = await req.json();
  const isAHolderOfToken = async ({
    tokenAddress,
    chain,
    type,
    fid,
  }: {
    tokenAddress: string | string[];
    chain: number;
    type: "ERC721" | "ERC20";
    fid: string;
  }) => {
    const userInfo = await User.findOne({
      farcaster: fid,
    });

    const wallets = [
      ...new Set(
        [...(userInfo?.wallets ?? [])]
          .filter((wallet) => wallet)
          .map((wallet) => wallet.toLowerCase())
      ),
    ];
    if (!wallets || !tokenAddress || !chain) return;

    if (type === "ERC721") {
      for (const token of tokenAddress) {
        const balancePromises = wallets.map(async (wallet) => {
          const {data} = await axios.get(
            `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.ALCHEMY_BASE_KEY}/isHolderOfContract?wallet=${wallet}}&contractAddress=${token}`
          );

          if (data?.isHolder) return 1;
        });
      }
      return 0;
    } else {
      let balance = 0;
      try {
        const balancePromises = wallets.map(async (wallet) => {
          if (!wallet) return 0;

          const response = await axios.get(
            `https://deep-index.moralis.io/api/v2.2/${wallet}/erc20?chain=${
              supportedChainsMoralis[chain] ?? "eth"
            }&token_addresses%5B0%5D=${tokenAddress}`,
            {
              headers: {
                "Content-Type": "application/json",
                "X-API-Key": process.env.NEXT_PUBLIC_MORALIS_API_KEY as string,
              },
            }
          );
          return response?.data[0]?.balance;
        });

        const balances = await Promise.all(balancePromises);
        const filteredBalances = balances.filter(
          (balance) =>
            balance !== null && balance !== 0 && balance !== undefined
        );
        if (filteredBalances.length === 0) return 0;
        balance = filteredBalances.reduce(
          (acc, curr) => Number(acc) + Number(curr),
          0
        );

        return balance / 10 ** 18;
      } catch (e) {
        console.error(e);
        return null;
      }
    }
  };

  try {
    const result = await isAHolderOfToken({tokenAddress, chain, type, fid});
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: error}, {status: 500});
  }
}
