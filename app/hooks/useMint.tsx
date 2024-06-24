import {NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS} from "@/lib/constants";
import axios from "axios";
import {useState, useCallback} from "react";
import {createWalletClient, http} from "viem";
import {privateKeyToAccount} from "viem/accounts";
import {baseSepolia} from "viem/chains";

// Define the type for the values prop
interface UseMintProps {
  values: string[];
  recipient: string;
}

// Define the type for the current state
interface MintState {
  status: "idle" | "processing" | "minting" | "completed" | "error";
  data: any; // You can replace `any` with the actual data type you're expecting
  error: string | null;
}

const useMint = ({values, recipient}: UseMintProps) => {
  const [currentState, setCurrentState] = useState<MintState>({
    status: "idle",
    data: null,
    error: null,
  });

  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: http(),
    account: privateKeyToAccount(
      process.env.NEXT_PUBLIC_ADMIN_WALLET_PRIVATE_KEY as `0x${string}`
    ),
  });

  // first do check if the given value has metadata generated
  const isValueExists = async (value: string) => {
    try {
      const {data} = await axios.get(`/api/value?name=${value}`);
      return data.value;
    } catch (error) {
      setCurrentState({
        status: "error",
        data: null,
        error: (error as any) ?? "An error occurred while checking the value",
      });
      return;
    }
  };
  // if not, generate metadata for the given value
  const generateMetadata = async (value: string) => {
    try {
      const {data} = await axios.post(`/api/batch-upload-pinata`, {
        values: [value],
      });
      return data.cid[0];
    } catch (error) {
      setCurrentState({
        status: "error",
        data: null,
        error:
          (error as any) ??
          "An error occurred while generating metadata for the value",
      });
      return;
    }
  };
  // if metadata is generated, mint the value
  const mintValues = async (cids: string[], recipient: string) => {
    try {
      const hash = await walletClient.writeContract({
        abi: NFT_CONTRACT_ABI,
        address: NFT_CONTRACT_ADDRESS,

        functionName: "batchMint",
        args: [recipient, cids],
      });
      return hash;
    } catch (error) {
      setCurrentState({
        status: "error",
        data: null,
        error: (error as any) ?? "An error occurred while minting the value",
      });
      return;
    }
  };

  const increaseWeightage = async (newCid: string, tokenId: string) => {
    try {
      const hash = await walletClient.writeContract({
        abi: NFT_CONTRACT_ABI,
        address: NFT_CONTRACT_ADDRESS,

        functionName: "updateTokenURI",
        args: [tokenId, newCid],
      });
      return hash;
    } catch (error) {
      setCurrentState({
        status: "error",
        data: null,
        error:
          (error as any) ?? "An error occurred while updating the weightage",
      });
      return;
    }
  };
  return {
    currentState,
  };
};

export default useMint;
