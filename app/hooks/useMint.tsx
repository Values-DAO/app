import {NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS} from "@/lib/constants";
import {IUser} from "@/models/user";
import {viemPublicClient} from "@/providers/privy-provider";
import axios from "axios";
import {useState, useCallback, use} from "react";
import {createWalletClient, http} from "viem";
import {privateKeyToAccount} from "viem/accounts";
import {baseSepolia} from "viem/chains";

// Define the type for the current state
interface MintState {
  status: "idle" | "processing" | "minting" | "completed" | "error";
  data: any; // You can replace `any` with the actual data type you're expecting
  error: string | null;
}

const useMint = () => {
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

  const increaseWeightage = async (
    valueName: string,
    tokenId: string,
    user: IUser
  ) => {
    try {
      const val = user?.mintedValues?.find((v) => v.value === valueName);
      const prevWeightage = val?.weightage ?? 1;
      const {data} = await axios.post(
        `/api/v1/pin-ipfs`,
        {
          values: [valueName],
          weightages: [Number(prevWeightage) + Number(1)],
        },
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
          },
        }
      );

      const newCid = data.cid[1];
      const hash = await walletClient.writeContract({
        abi: NFT_CONTRACT_ABI,
        address: NFT_CONTRACT_ADDRESS,

        functionName: "updateTokenURI",
        args: [tokenId, newCid],
      });

      const response = await axios.post(
        `/api/user`,
        {
          method: "update_minted_value",
          farcaster: user.farcaster,
          email: user.email,
          value: valueName,
          weightage: Number(prevWeightage) + Number(1),
        },
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
          },
        }
      );
      console.log(response.data);
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
  const fetchValueNftsUser = async (walletAddress: string) => {
    try {
      const data: any = await viemPublicClient.readContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_CONTRACT_ABI,
        functionName: "getUserNFTs",
        args: [walletAddress],
      });

      return {
        values: data[0],
        tokenIds: data[1],
      };
    } catch (error) {
      console.error(error);
      return {
        values: [],
        tokenIds: [],
      };
    }
  };
  const mintHandler = async ({
    values,
    userIdentity,
    walletAddresses,
  }: {
    values: string[];
    userIdentity: String | Number;
    walletAddresses: string[];
  }) => {
    // Set the status to processing
    setCurrentState({
      status: "processing",
      data: null,
      error: null,
    });
    // Check if the value exists

    // check if the value is already minted by the user, if so then do weightage increase

    const {data} = await axios.get(
      `/api/user?${
        userIdentity.toString().includes("@") ? "email" : "fid"
      }=${userIdentity}`,
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      }
    );

    const user: IUser = data.user;

    const mintedValues = user.mintedValues;

    for (const value of values) {
      const existingValue = mintedValues?.find((v) => v.value === value);
      if (existingValue) {
        const userNfts = await Promise.all(
          walletAddresses.map(async (walletAddress) => {
            return await fetchValueNftsUser(walletAddress);
          })
        );

        // find the tokenid of the value nft already minted by the user,
        // say user has already minted 'humility' when they mint again,
        // we first get the tokenid of the nft that says 'humility' held by the user
        const tokenIdUserMintedNFTIndex = userNfts.findIndex((userNft) =>
          userNft.values.includes(value)
        );

        const tokenIdUserMintedNFT =
          userNfts[tokenIdUserMintedNFTIndex].tokenIds[
            userNfts[tokenIdUserMintedNFTIndex].values.indexOf(value)
          ];

        // generate metadata for the updated weightage for the given value nft

        await increaseWeightage(value, tokenIdUserMintedNFT, user);
      }
    }
  };
  return {
    currentState,
    mintHandler,
  };
};

export default useMint;
