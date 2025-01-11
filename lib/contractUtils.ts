import { bondingCurveABI } from "@/contracts/bondingCurveABI";
import { factoryABI } from "@/contracts/factoryABI";
import { encodeFunctionData } from "viem";

// Encode function data for "activeSupply" call
export const encodeActiveSupplyFunctionData = () => {
  return encodeFunctionData({
    abi: bondingCurveABI,
    functionName: "activeSupply",
    args: [],
  });
};

// Encode function data for "buyToken" call
export const encodeBuyTokenData = (amount: number) => {
  return encodeFunctionData({
    abi: bondingCurveABI,
    functionName: "buyToken",
    args: [amount],
  });
};

export const encodeValueData = (amount: number) => {
  return encodeFunctionData({
    abi: bondingCurveABI,
    functionName: "calculateRequiredEthForUsd",
    args: [amount],
  });
}

export const encodeCreateTokenData = async ({
  tokenName,
  tokenSymbol,
  description,
  curatorTreasuryAllocation,
}: {
  tokenName: string;
  tokenSymbol: string;
  description: string;
  curatorTreasuryAllocation: string;
}) => {
  return encodeFunctionData({
    abi: factoryABI,
    functionName: "initialiseToken",
    args: [
      tokenName,
      tokenSymbol,
      description,
      [
        curatorTreasuryAllocation,
        "0x78db1057A9A1102C3E831E5086B75E9a58e7730c",
        "0x78db1057A9A1102C3E831E5086B75E9a58e7730c",
      ],
      [5000000000, 4000000000, 1000000000], // 5B, 4B, 1B
    ],
  });
};

export const getWallet = (wallets: any) => {
  const wallet = wallets.find((wallet: any) => wallet.walletClientType === "privy") || wallets[0];
  if (!wallet) {
    console.error("No wallet found");
    return;
  }
  return wallet;
};

// Get the Ethereum provider
export const getProvider = async (wallet: any) => {
  return await wallet!.getEthereumProvider();
};