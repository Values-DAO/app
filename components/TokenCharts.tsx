"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CircleDollarSign, MessageCircle } from "lucide-react";
import { useState } from "react";
import { ProgressChart } from "./ProgressChart";
import { API_BASE_URL } from "@/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "./ui/skeleton";
import { useUserContext } from "@/providers/user-context-provider";

interface HistoryEntry {
  icon: "dollar" | "message";
  title: string;
  tokens: number;
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

const fetchTokenData = async ({trustPoolId}: {trustPoolId: string}) => {
  const response = await fetch(`${API_BASE_URL}/cultureToken/tokenData?trustPoolId=${trustPoolId}`);
  const data = await response.json();
  return data.tokenData || {tokenName: "Culture", tokenSymbol: "CULTURE"};
}

const fetchTokenPrice = async ({trustPoolId}: {trustPoolId: string}) => {
  const response = await fetch(`${API_BASE_URL}/cultureToken/tokenPrice?trustPoolId=${trustPoolId}`);
  const data = await response.json();
  return data.tokenPrice || 0;
}

const fetchTokenTotalSupply = async ({trustPoolId}: {trustPoolId: string}) => {
  const response = await fetch(`${API_BASE_URL}/cultureToken/marketCap?trustPoolId=${trustPoolId}`);
  const data = await response.json();
  return data.totalSupply || 0;
}

// const fetchUserTxHistory = async ({trustPoolId}: {trustPoolId: string}) => {
//   const response = await fetch(`${API_BASE_URL}/cultureToken/userTxHistory?trustPoolId=${trustPoolId}`);
//   const data = await response.json();
//   return data.userTxHistory || [];
// }

export function TokenCharts({ trustPoolId }: { trustPoolId: string }) {
  const [mode, setMode] = useState<"buy" | "earn">("buy");
  const [socialPostLink, setSocialPostLink] = useState("");
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();
  const {userInfo} = useUserContext();

  const amountOptions = ["50", "500", "1000"];

  // Queries
  const {
    data: tokenData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tokenData", trustPoolId],
    queryFn: () => fetchTokenData({ trustPoolId }),
  });
  
  const {data: tokenPrice, isLoading: isTokenPriceLoading, isError: isTokenPriceError} = useQuery({
    queryKey: ["tokenPrice", trustPoolId],
    queryFn: () => fetchTokenPrice({trustPoolId}),
  })
  
  const {
    data: tokenTotalSupply,
    isLoading: isTokenTotalSupplyLoading,
    isError: isTokenTotalSupplyError,
  } = useQuery({
    queryKey: ["tokenTotalSupply", trustPoolId],
    queryFn: () => fetchTokenTotalSupply({ trustPoolId }),
  });
  
  const handleBuy = async () => {
    const response = await axios.post(`${API_BASE_URL}/cultureToken/buy`, {
      trustPoolId,
      amount,
    })
    
    if (response.status === 200) {
      
      
      // queryClient.invalidateQueries(["userTxHistory", trustPoolId]);
    } else {
      console.error("Error buying tokens:", response.data);
    }
  }
  
  const handleEarn = async () => {
    const response = await axios.post(`${API_BASE_URL}/cultureToken/earn`, {
      trustPoolId,
      socialPostLink,
      username: userInfo?.twitterUsername || userInfo?.farcasterUsername || userInfo?.email,
    })
    
    if (response.status === 200) {
      
      
      // queryClient.invalidateQueries(["userTxHistory", trustPoolId]);
    } else {
      console.error("Error earning tokens:", response.data);
    }
    
    setSocialPostLink("");
  }

  return (
    <div className="space-y-6 p-4 bg-white min-h-screen">
      <div>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-6">${tokenData.tokenSymbol}</h1>
          <div className="flex items-center gap-1">
            <CircleDollarSign className="w-4 h-4" />
            <span className="font-medium">20.5K</span>
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
            />
            {userInfo?.userId ? (
              <Button className="w-full text-black text-lg p-6 font-medium rounded-full bg-yellow-400 hover:bg-yellow-500">
                Please sign in to earn
              </Button>
            ) : (
              <Button
                className="w-full text-black text-lg p-6 font-medium rounded-full bg-yellow-400 hover:bg-yellow-500"
                onClick={handleEarn}
              >
                Submit
              </Button>
            )}
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
          <Progress value={15} className="h-2" />
          <div className="flex justify-between text-sm text-gray-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="text-sm text-gray-400">Graduate this coin to uniswap at $69,420 market cap.</p>
          <div className="text-sm text-gray-600">
            {isTokenTotalSupplyError || isTokenPriceLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : isTokenPriceError || isTokenTotalSupplyError ? (
              <span>Error loading market cap</span>
            ) : (
              <span>Current Market Cap: ${tokenPrice * tokenTotalSupply}</span>
            )}
          </div>
        </div>
      </div>

      {/* <div className="space-y-4">
        <h3 className="text-2xl font-bold">History</h3>
        <div className="text-gray-400 text-lg">TODAY</div>
        <div className="space-y-3">
          {historyData.map((entry, index) => (
            <HistoryItem key={index} entry={entry} />
          ))}
        </div>
      </div> */}
    </div>
  );
}
