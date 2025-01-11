import axios from "axios";
import { getEthPriceInUsdc } from "../services/blockchain";
import { formatSupply } from "../utils";
import { API_BASE_URL } from "@/constants";
import type { TokenData, UserTokenData } from "@/types";

export const getNewTokenPriceAndMarketCap = async (decodedLogs: any) => {
  const rawTokenPrice = decodedLogs.args.currentTokenPrice;
  const formattedTokenPrice = formatSupply(rawTokenPrice);
  const rawTotalSupply = decodedLogs.args.currentTokenSupply;
  const formattedTotalSupply = formatSupply(rawTotalSupply);
  const marketCapInETH = Number(formattedTokenPrice) * Number(formattedTotalSupply);
  
  return { newTokenPriceInETH: Number(formattedTokenPrice), newMarketCapInETH: marketCapInETH };
}

export const updateTokenPriceAndMarketCap = async (tokenPrice: number, marketCap: number, tokenAddress: string) => {
  const response = await axios.post(`${API_BASE_URL}/cultureToken/updateTokenPriceAndMarketCap`, {
    tokenPrice,
    marketCap,
    tokenAddress,
  })
  
  if (response.status !== 200) {
    throw new Error("Failed to update token price and market cap.");
  }
}

export const updateUserTransactionHistory = async (userId: string, tokenAddress: string, amount: string, num: string) => {
  const tokenAmount = formatSupply(num);
  console.log(tokenAmount)
  const response = await axios.post(`${API_BASE_URL}/cultureToken/updateUserTransactionHistory`, {
    userId,
    tokenAddress,
    amount,
    num: tokenAmount,
  })
  
  if (response.status !== 200) {
    throw new Error("Failed to update user transaction history.");
  }
}

export const updateChartPrices = async (tokenPrice: number, marketCap: number, tokenAddress: string) => {
  const response = await axios.post(`${API_BASE_URL}/cultureToken/updateChartPrices`, {
    tokenPrice,
    marketCap,
    tokenAddress,
  })
  
  if (response.status !== 200) {
    throw new Error("Failed to update chart prices.");
  }
}

export const fetchTokenData = async ({ trustPoolId }: { trustPoolId: string }): Promise<TokenData> => {
  const response = await fetch(`${API_BASE_URL}/cultureToken/tokenData?trustPoolId=${trustPoolId}`);
  const result = await response.json();

  if (result.status === 200 && result.data?.tokenData) {
    return result.data.tokenData;
  }

  throw new Error("Failed to fetch token data");
};

export const fetchUserTokenData = async ({
  userId,
  walletAddress,
  tokenAddress,
}: {
  userId: string;
  walletAddress: string;
  tokenAddress: string;
}): Promise<UserTokenData> => {
  const response = await fetch(
    `${API_BASE_URL}/cultureToken/userTokenData?userId=${userId}&walletAddress=${walletAddress}&tokenAddress=${tokenAddress}`
  );
  const result = await response.json();

  if (result.status === 200 && result.data) {
    return result.data;
  }

  throw new Error("Failed to fetch user data");
};