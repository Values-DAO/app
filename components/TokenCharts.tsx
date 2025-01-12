"use client"

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { getWallet } from "@/lib/contractUtils";
import { useUserContext } from "@/providers/user-context-provider";
import { TokenHeader } from "./TokenHeader";
import { TokenPrice } from "./TokenPrice";
import { TokenPurchase } from "./TokenPurchase";
import { TokenInfo } from "./TokenInfo";
import { TokenProgress } from "./TokenProgress";
import { TokenHistory } from "./TokenHistory";
import type { TokenData, UserTokenData } from "@/types";
import { fetchChartData, fetchTokenData, fetchUserTokenData } from "@/lib/actions/token.actions";
import {ProgressChart} from "./ProgressChart";

export function TokenCharts({ trustPoolId }: { trustPoolId: string }) {
  const { userInfo } = useUserContext();
  const { ready, wallets } = useWallets();
  const [embeddedWallet, setEmbeddedWallet] = useState<any>(null);
  const [price, setPrice] = useState(0); // in eth
  const [marketCap, setMarketCap] = useState(0); // in eth

  // First fetch token data and charts data
  const {
    data: tokenData,
    isLoading: isTokenDataLoading, 
    isError: isTokenDataError,
  } = useQuery<TokenData>({
    queryKey: ["tokenData", trustPoolId],
    queryFn: () => fetchTokenData({ trustPoolId }),
  });
  
  const {
    data: chartData,
    isLoading: isChartDataLoading,
    isError: isChartDataError,
  } = useQuery({
    queryKey: ["chartData", trustPoolId],
    queryFn: () => fetchChartData({ trustPoolId }),
  })

  // Then fetch user data once prerequisites are ready
  const {
    data: userTokenData,
    isLoading: isUserTokenDataLoading,
    isError: isUserTokenDataError,
  } = useQuery<UserTokenData>({
    queryKey: ["userData", userInfo?.userId],
    queryFn: () =>
      fetchUserTokenData({
        userId: userInfo?.userId!,
        walletAddress: embeddedWallet?.address,
        tokenAddress: tokenData?.tokenAddress!,
      }),
    enabled: Boolean(userInfo?.userId && embeddedWallet && tokenData),
  });

  useEffect(() => {
    if (ready) {
      setEmbeddedWallet(getWallet(wallets));
    }
  }, [ready, wallets]);

  useEffect(() => {
    if (tokenData) {
      setPrice(tokenData.price);
      setMarketCap(tokenData.marketCap);
    }
  }, [tokenData]);

  if (isTokenDataError || isUserTokenDataError) {
    return <ErrorState />;
  }

  return (
    <div className="space-y-6 p-4 min-h-screen">
      <TokenHeader
        userInfo={userInfo}
        embeddedWallet={embeddedWallet}
        isLoading={!ready}
        balance={userTokenData?.tokenBalance!}
      />

      <TokenPrice tokenData={tokenData} price={price} isLoading={isTokenDataLoading} />

      <ProgressChart isLoading={isChartDataLoading} data={chartData}/>

      <TokenPurchase
        tokenData={tokenData}
        embeddedWallet={embeddedWallet}
        userInfo={userInfo}
        setPrice={setPrice}
        setMarketCap={setMarketCap}
        isLoading={isTokenDataLoading}
        trustPoolId={trustPoolId}
      />

      <TokenInfo tokenData={tokenData} isLoading={isTokenDataLoading} />

      <TokenProgress tokenData={tokenData} marketCap={marketCap} isLoading={isTokenDataLoading} />

      <TokenHistory userTokenData={userTokenData} isLoading={isUserTokenDataLoading} />
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">ERROR 404: Token not found!</h1>
        <p className="text-center">
          It looks like either you've hit the wrong route or there's an issue with the token you're looking for. Please
          check the URL or try again later.
        </p>
      </div>
    </div>
  );
}