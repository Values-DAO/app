import { bondingCurveABI } from "@/contracts/bondingCurveABI";
import { factoryABI, factoryContractAddress } from "@/contracts/factoryABI";
import { viemPublicClient } from "@/providers/privy-provider";
import type { TokenData } from "@/types";
import { ethers, keccak256 } from "ethers";
import { decodeEventLog, toHex } from "viem";
import { waitForTransactionReceipt } from "viem/actions";

// Get the price of ETH in USDC
export const getEthPriceInUsdc = async () => {
  const url = "https://api.g.alchemy.com/prices/v1/tokens/by-symbol?symbols=ETH&symbols=USDC";
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer sCRkeELOK2UImXTjQsv3HsfyvaQ1qlIV`,
  };

  const response = await fetch(url, { method: "GET", headers });
  const data = await response.json();

  const ethPriceInUsd = data.data[0].prices[0].value;
  const usdcPriceInUsd = data.data[1].prices[0].value;

  const ethPrice = ethPriceInUsd / usdcPriceInUsd;
  return ethPrice;
};

// Fetch the active supply of a token
export const fetchActiveSupply = async (provider: any, encodedData: any, tokenData: TokenData) => {
  const callRequest = {
    to: tokenData.bondingCurveAddress,
    data: encodedData,
  };
  
  const result = await provider.request({
    method: "eth_call",
    params: [callRequest, "latest"],
  });
  
  console.log("Active Supply (raw):", result);
  console.log("Type of result:", typeof result);
  return BigInt(result).toString();
};

// Fetch the ETH Value required to buy a token
export const fetchETHValue = async (provider: any, encodedData: any, tokenData: TokenData) => {
  const callRequest = {
    to: tokenData.bondingCurveAddress,
    data: encodedData,
  };

  const result = await provider.request({
    method: "eth_call",
    params: [callRequest, "latest"],
  });
  
  return BigInt(result).toString();
}

export const callForCreateToken = async (provider: any, encodedData: any) => {
  const callRequest = {
    to: factoryContractAddress,
    data: encodedData,
  };
  
  const result = await provider.request({
    method: "eth_sendTransaction",
    params: [callRequest],
  });
  
  return result;
}

export const getDecodedLogsForCreateToken = async (receipt: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1990));

  const initialisedLog = receipt.logs.find((log: any) =>
    log.topics.some((topic: any) => topic === keccak256(toHex("TokenCreated(address,string,string,address,address)")))
  );

  if (initialisedLog) {
    const decoded = decodeEventLog({
      abi: factoryABI,
      eventName: "Initialised",
      data: initialisedLog.data,
      topics: initialisedLog.topics,
    });
    
    return decoded;
  } else {
    console.log("No logs found for create token");
    return null;
  }
}

// Sends a transaction for buying tokens
const callForBuyToken = async (provider: any, encodedData: any, tokenData: TokenData, equivalentETH: number) => {
  const callRequest = {
    to: tokenData.bondingCurveAddress,
    data: encodedData,
    value: ethers.parseEther(equivalentETH!.toString()),
    gasLimit: 2000000,
  };
   
   const result = await provider.request({
     method: "eth_sendTransaction",
     params: [callRequest, "latest"],
   });
   
   return result
}

const getDecodedLogsForBuyToken = async (receipt: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1990));
  
  const purchasedLogs = receipt.logs.find((log: any) =>
    log.topics.some(
      (topic: any) => topic === keccak256(toHex("TokensPurchased(address,address,uint256,uint256,uint256,uint256,uint256)"))
    )
  );

  if (purchasedLogs) {
    const decoded = decodeEventLog({
      abi: bondingCurveABI,
      eventName: "TokensPurchased",
      data: purchasedLogs.data,
      topics: purchasedLogs.topics,
    });
    
    return decoded;
  } else {
    console.log("No logs found for buy token");
    return null;
  }
}

// Buy tokens by sending a transaction
export const buyToken = async (provider: any, encodedData: any, tokenData: TokenData, equivalentETH: number) => {
  const result = await callForBuyToken(provider, encodedData, tokenData, equivalentETH);
  const receipt = await waitForTransactionReceipt(viemPublicClient, { hash: result });
  const decodedLogs = await getDecodedLogsForBuyToken(receipt);
  return {result, decodedLogs};
};