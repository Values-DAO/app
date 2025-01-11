import CandlestickChart from "./ProgressChart";
import { Skeleton } from "./ui/skeleton";

export function TokenPrice({ tokenData, price, isLoading }: { tokenData: any; price: number; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold tracking-wide">${tokenData.tokenSymbol}</h1>
        <div className="px-3 py-1 bg-white rounded-full font-semibold">
          {price.toFixed(15)} ETH
        </div>
      </div>
      <CandlestickChart />
    </div>
  );
}
