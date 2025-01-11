import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getEthPriceInUsdc } from "@/lib/services/blockchain";
import type { TokenData } from "@/types";
import { useEffect, useState } from "react";

export function TokenProgress({ tokenData, marketCap, isLoading }: { tokenData: TokenData | undefined; marketCap: number; isLoading: boolean }) {
  const [ethPrice, setEthPrice] = useState<number>();
  const [isPriceLoading, setIsPriceLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchEthPrice = async () => {
      const price = await getEthPriceInUsdc();
      setEthPrice(price);
    };
    
    fetchEthPrice()
    setIsPriceLoading(false);
  }, [marketCap])
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full" />
          <div className="flex justify-between mt-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-16 w-full mt-4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-40" />
        </div>
      </div>
    );
  }

  if (!tokenData) return null;

  const progressPercentage = isPriceLoading ? 0 : (Number(ethPrice) * marketCap) / 694.2;

  return (
    <div>
      <div>
        <h3 className="text-2xl font-semibold mb-2 tracking-wide">Bonding Curve Progress</h3>
        <div className="space-y-2">
          <Progress value={progressPercentage} />
          <div className="flex justify-between text-sm text-gray-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="text-gray-400 font-semibold text-base">
            Graduate this coin to uniswap at $69,420 market cap. Currently there is $
            {isPriceLoading ? 0 : (Number(ethPrice) * marketCap).toFixed(2)} in the bonding curve.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-2xl font-semibold tracking-wide mb-3">Culture Book Curve Progress</h3>
        <p className="text-gray-400 font-semibold text-lg">
          {tokenData.weeksSinceCreation} Weeks / {progressPercentage.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
