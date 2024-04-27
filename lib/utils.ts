import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getChainName(chainId: number) {
  switch (chainId) {
    case 1:
      return "Ethereum";
    case 10:
      return "Optimism";

    case 56:
      return "Binance Smart Chain";
    case 97:
      return "Binance Smart Chain Testnet";
    case 137:
      return "Matic";
    case 80001:
      return "Mumbai";
    case 84532:
      return "Base Sepolia";
    default:
      return "Unknown";
  }
}
