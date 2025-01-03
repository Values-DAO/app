"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CircleDollarSign, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { ProgressChart } from "./ProgressChart";
import { API_BASE_URL } from "@/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "./ui/skeleton";
import { useUserContext } from "@/providers/user-context-provider";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useInitialisedEvents } from "@/lib/utils";
import { encodeFunctionData, erc20Abi } from "viem";
import {readContract} from "@wagmi/core"
import { config } from "@/contracts/config";
import { bondingCurveABI } from "@/contracts/bondingCurveABI";
import { ethers } from "ethers";


interface HistoryEntry {
  icon: "dollar" | "message";
  title: string;
  tokens: number;
}

interface TokenData {
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  bondingCurveAddress: string;
}

const historyData: HistoryEntry[] = [
  {
    icon: "dollar",
    title: "Bought $50 worth of tokens",
    tokens: 2000,
  },
  {
    icon: "message",
    title: "X Content added",
    tokens: 200,
  },
];

function HistoryItem({ entry }: { entry: HistoryEntry }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
      <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center">
        {entry.icon === "dollar" ? (
          <CircleDollarSign className="w-6 h-6 text-black" />
        ) : (
          <MessageCircle className="w-6 h-6 text-black" />
        )}
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold">{entry.title}</h4>
        <p className="text-emerald-500">+{entry.tokens.toLocaleString()} Tokens</p>
      </div>
    </div>
  );
}

const fetchTokenData = async ({ trustPoolId }: { trustPoolId: string }): Promise<TokenData> => {
  const response = await fetch(`${API_BASE_URL}/cultureToken/tokenData?trustPoolId=${trustPoolId}`);
  const result = await response.json();

  if (result.status === 200 && result.data?.tokenData) {
    return result.data.tokenData;
  }

  throw new Error("Failed to fetch token data");
};

// const fetchTokenPrice = async ({ trustPoolId }: { trustPoolId: string }) => {
//   const response = await fetch(`${API_BASE_URL}/cultureToken/tokenPrice?trustPoolId=${trustPoolId}`);
//   const data = await response.json();
//   return data.price || 0;
// };

// const fetchTokenTotalSupply = async ({ trustPoolId }: { trustPoolId: string }) => {
//   const response = await fetch(`${API_BASE_URL}/cultureToken/totalSupply?trustPoolId=${trustPoolId}`);
//   const data = await response.json();
//   return data.totalSupply || 0;
// };

export function TokenCharts({ trustPoolId }: { trustPoolId: string }) {
  const [mode, setMode] = useState<"buy" | "earn">("buy");
  const [socialPostLink, setSocialPostLink] = useState("");
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();
  const { userInfo } = useUserContext();
  const { ready, wallets } = useWallets();
  const [price, setPrice] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const {exportWallet} = usePrivy()

  const amountOptions = ["5", "50", "100"];

  // Queries
  const {
    data: tokenData,
    isLoading,
    isError,
  } = useQuery<TokenData>({
    queryKey: ["tokenData", trustPoolId],
    queryFn: () => fetchTokenData({ trustPoolId }),
  });

  // const {
  //   data: tokenPrice,
  //   isLoading: isTokenPriceLoading,
  //   isError: isTokenPriceError,
  // } = useQuery({
  //   queryKey: ["tokenPrice", trustPoolId],
  //   queryFn: () => fetchTokenPrice({ trustPoolId }),
  // });

  // const {
  //   data: tokenTotalSupply,
  //   isLoading: isTokenTotalSupplyLoading,
  //   isError: isTokenTotalSupplyError,
  // } = useQuery({
  //   queryKey: ["tokenTotalSupply", trustPoolId],
  //   queryFn: () => fetchTokenTotalSupply({ trustPoolId }),
  // });
  // const { initialisedEvents, loading, error: error } = useInitialisedEvents();
  
  // const getTokenTotalSupply = async () => {
  //   // @ts-ignore
  //   const address = initialisedEvents[0].createdTokenAddy;
  //   const result = await readContract(config, {
  //     abi: erc20Abi,
  //     address,
  //     functionName: "totalSupply",
  //   });
  //   console.log("Total Supply: ", result);
  //   setTotalSupply(Number(result));
  // };
  
  // const getTokenPrice = async () => {
  //   const communityId = initialisedEvents[0].communityId;
  //   const result = await readContract(config, {
  //     abi: ABI,
  //     address: factoryAddress,
  //     functionName: "price",
  //     args: [communityId],
  //   }); 
  //   console.log("Price: ", Number(result) / 10 ** 9);
  //   setPrice(Number(result)/10**9);
  // }
  
  // useEffect(() => {
  //   getTokenPrice();
  //   getTokenTotalSupply();
  // })

  

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !tokenData) {
    return <div>Error loading token data</div>;
  }

  let embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy");
  
  if (!embeddedWallet) {
    embeddedWallet = wallets[0];
  }

  if (!embeddedWallet) {
    console.error("No wallet found");
  }
  
  const getActiveSupply = async () => {
    try {
      const provider = await embeddedWallet!.getEthereumProvider();

      const data = encodeFunctionData({
        abi: bondingCurveABI,
        functionName: "activeSupply",
        args: [],
      });

      const callRequest = {
        to: tokenData.bondingCurveAddress,
        data: data,
      };

      const result = await provider.request({
        method: "eth_call",
        params: [callRequest, "latest"],
      });

      const activeSupply = BigInt(result).toString();
      console.log("Active Supply (raw):", activeSupply);

      const formattedSupply = ethers.formatUnits(activeSupply, 18); 
      console.log("Formatted Active Supply:", formattedSupply);

      return formattedSupply; 
    } catch (error) {
      console.error("Error getting active supply:", error);
    }
  }
  
  const getMarketCap = async () => {
    const activeSupply = await getActiveSupply();
    const price = await getPriceOfToken();
    
    console.log("Price: ", price);
    console.log("active: ", activeSupply);
    
    const url = "https://api.g.alchemy.com/prices/v1/tokens/by-symbol?symbols=ETH&symbols=USDC";
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer sCRkeELOK2UImXTjQsv3HsfyvaQ1qlIV`,
    };

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    const data = await response.json();

    const ethPriceInUsd = data.data[0].prices[0].value;
    const usdcPriceInUsd = data.data[1].prices[0].value;
    
    const ethPrice = ethPriceInUsd / usdcPriceInUsd;
    
    console.log("ETH Price for 1 USDC:", ethPrice);
    
    setTotalSupply((activeSupply) * (price) * ethPrice);
    console.log("Market Cap:", (activeSupply) * (price) * ethPrice);
    return ((activeSupply) * (price) * ethPrice);
  }
  
  const getTokenQty = async () => {
    try {
      const provider = await embeddedWallet!.getEthereumProvider();
      
      const data = encodeFunctionData({
        abi: bondingCurveABI,
        functionName: "calculateCoinAmountOnUSDAmt",
        args: [
          amount,
        ]
      })
        
      const transactionRequest = {
        to: tokenData.bondingCurveAddress,
        data: data,
      }
      
      const result = await provider.request({
        method: "eth_call",
        params: [transactionRequest, "latest"],
      })
      
      const tokenQty = BigInt(result).toString(); 
      console.log("Token Quantity (raw):", tokenQty);

      return tokenQty;
    } catch (error) {
      console.error("Error getting token quantity:", error);
    }
  }
  
  const getEquivalentETH = async () => {
    try {
      const url = "https://api.g.alchemy.com/prices/v1/tokens/by-symbol?symbols=ETH&symbols=USDC";
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer sCRkeELOK2UImXTjQsv3HsfyvaQ1qlIV`,
      };

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      })
      
      const data = await response.json();
        
      const ethPriceInUsd = data.data[0].prices[0].value;
      const usdcPriceInUsd = data.data[1].prices[0].value;
      
      const ethPrice = ethPriceInUsd / usdcPriceInUsd;
      
      const equivalentETH = Number(amount) / ethPrice;
      
      console.log("Equivalent ETH:", equivalentETH);
      
      return equivalentETH;
    } catch (error) {
      console.error("Error getting equivalent ETH:", error);
    }
  }
  
  
  const handleBuy = async () => {
    try {
      const provider = await embeddedWallet!.getEthereumProvider();
      
      const equivalentETH = await getEquivalentETH();
      const tokenQty = await getTokenQty();
      
      const data = encodeFunctionData({
        abi: bondingCurveABI,
        functionName: "buyToken",
        args: [
          tokenData.tokenAddress,
          tokenQty
        ],
      })
      
      const transactionRequest = {
        to: tokenData.bondingCurveAddress,
        data: data,
        value: ethers.parseEther(equivalentETH!.toString()),
        gasLimit: 200000,
      };
      
      const transactionHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });
      
      console.log("Transaction Hash: ", transactionHash);
    } catch (error) {
      console.error("Error buying tokens:", error);
    }
  };
  
  const getPriceOfToken = async () => {
    try {
      const provider = await embeddedWallet!.getEthereumProvider();
      
      const data = encodeFunctionData({
        abi: bondingCurveABI,
        functionName: "getCurrentPrice",
        args: [],
      });
      
      const transactionRequest = {
        to: tokenData.bondingCurveAddress,
        data: data,
      };
      
      const result = await provider.request({
        method: "eth_call",
        params: [transactionRequest, "latest"],
      });
      
      const price = BigInt(result).toString();
      console.log("Price of Token (raw):", price);
      
      const formattedPrice = ethers.formatUnits(price, 18);
      console.log("Formatted Price of Token:", formattedPrice);
      
      setPrice(Number(formattedPrice));
      return formattedPrice;
    } catch (error) {
      console.error("Error getting price of token:", error);
    }
  }
  
  // useEffect(() => {
  //   getPriceOfToken();
  // }, []);

  const handleEarn = async () => {
    const response = await axios.post(`${API_BASE_URL}/cultureToken/earn`, {
      trustPoolId,
      socialPostLink,
      username: userInfo?.twitterUsername || userInfo?.farcasterUsername || userInfo?.email,
    });

    if (response.status === 200) {
      console.log("Successfully earned tokens");
      // queryClient.invalidateQueries(["userTxHistory", trustPoolId]);
    } else {
      console.error("Error earning tokens:", response.data);
    }

    setSocialPostLink("");
  };

  return (
    <div className="space-y-6 p-4 bg-white min-h-screen">
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-6">${tokenData.tokenSymbol}</h1>
          <div className="flex items-center gap-1">
            <span className="font-medium">${price} USDC</span>
            <Button onClick={getPriceOfToken}>Get Price</Button>
            <Button onClick={getMarketCap}>Get Market Cap</Button>
            <Button onClick={exportWallet}>Export Wallet</Button>
          </div>
        </div>
        <ProgressChart />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">{tokenData.tokenName} Culture Token</h2>
        <div className="flex p-1 bg-gray-100 rounded-full mb-4">
          <Button
            variant="ghost"
            className={`flex-1 rounded-full px-3 py-6 text-lg font-medium ${
              mode === "buy" ? "bg-yellow-400 text-black" : "text-gray-400"
            }`}
            onClick={() => setMode("buy")}
          >
            I want to Buy
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 rounded-full px-3 py-6 text-lg font-medium ${
              mode === "earn" ? "bg-yellow-400 text-black" : "text-gray-400"
            }`}
            onClick={() => setMode("earn")}
          >
            I want to Earn
          </Button>
        </div>

        {mode === "buy" ? (
          <div className="space-y-4">
            <Input
              placeholder="$ Amount"
              className="p-6 text-gray-400 text-lg font-medium bg-gray-100 rounded-full"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex gap-2 justify-between">
              {amountOptions.map((opt) => (
                <Button
                  key={opt}
                  variant="outline"
                  className="flex-1 text-lg p-6 text-gray-400 bg-gray-100 rounded-full hover:bg-gray-200"
                  onClick={() => setAmount(opt)}
                >
                  $ {opt}
                </Button>
              ))}
            </div>
            <Button
              className="w-full text-black text-lg p-6 font-medium rounded-full bg-yellow-400 hover:bg-yellow-500"
              onClick={handleBuy}
            >
              Buy
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder="Social Post Public Link"
              className="p-6 text-gray-400 text-lg font-medium bg-gray-100 rounded-full"
              value={socialPostLink}
              onChange={(e) => setSocialPostLink(e.target.value)}
            />

            <Button
              className="w-full text-black text-lg p-6 font-medium rounded-full bg-yellow-400 hover:bg-yellow-500"
              onClick={handleEarn}
            >
              Submit
            </Button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold mb-2">${tokenData.tokenName}</h3>
        <p className="text-gray-400 mb-6">
          A vibrant and engaging community event designed to bring people together for fun and learning. Join us for a
          day filled with activities, workshops, and opportunities to...
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-2">Bonding Curve Progress</h3>
        <div className="space-y-2">
          {/* progress bar for totalSupply * price / 69420 */}
          {/* <Progress value={(totalSupply * price) * 10000} />
          <div className="flex justify-between text-sm text-gray-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div> */}
          <p className="text-sm text-gray-400">Graduate this coin to uniswap at $69,420 market cap.</p>
          <div className="text-sm text-gray-600">
            <span>Current Market Cap: {totalSupply} USDC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
