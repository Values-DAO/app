import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { encodeBuyTokenData, encodeValueData, getProvider } from "@/lib/contractUtils";
import { buyToken, fetchETHValue } from "@/lib/services/blockchain";
import { formatSupply } from "@/lib/utils";
import { getNewTokenPriceAndMarketCap, updateChartPrices, updateTokenPriceAndMarketCap, updateUserTransactionHistory } from "@/lib/actions/token.actions";
import { useQueryClient } from "@tanstack/react-query";

export function TokenPurchase({ tokenData, embeddedWallet, userInfo, setPrice, setMarketCap, isLoading }: { tokenData: any; embeddedWallet: any; userInfo: any; setPrice: any; setMarketCap: any; isLoading: boolean }) {
  const [amount, setAmount] = useState<number>();
  const queryClient = useQueryClient();
  const amountOptions = ["20", "500", "1000"];
  
  const handleBuy = async () => {
    try {
      const provider = await getProvider(embeddedWallet);
      const encodedValueData = encodeValueData(amount!);
      const rawValue = await fetchETHValue(provider, encodedValueData, tokenData);
      const formattedValue = formatSupply(rawValue);
      const encodedBuyData = encodeBuyTokenData(amount!);
      const { result, decodedLogs } = await buyToken(provider, encodedBuyData, tokenData, Number(formattedValue));
      
      console.log("Transaction Hash:", result);
      console.log("Decoded Logs:", decodedLogs);
      
      const { newTokenPriceInETH, newMarketCapInETH } = await getNewTokenPriceAndMarketCap(decodedLogs);
      
      setPrice(newTokenPriceInETH);
      setMarketCap(newMarketCapInETH); 
      
      // @ts-ignore
      await updateTokenPriceAndMarketCap(newTokenPriceInETH, newMarketCapInETH, decodedLogs?.args?.token); // @ts-ignore
      await updateUserTransactionHistory(userInfo?.userId!, decodedLogs?.args?.token, amount, decodedLogs?.args?.amount); // @ts-ignore
      await updateChartPrices(newTokenPriceInETH, newMarketCapInETH, decodedLogs?.args?.token);
      
      await queryClient.invalidateQueries({ queryKey: ["userData", userInfo?.userId] });
    } catch (error) {
      console.error("Error buying tokens:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-full" />
        <div className="flex gap-2 justify-between">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 flex-1 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-wide mb-4 ">${tokenData.tokenName} Culture Token</h2>
      <div className="space-y-4">
        <Input
          placeholder="$ Amount"
          className="p-6 text-lg font-medium bg-white rounded-full placeholder:text-gray-400"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <div className="flex gap-2 justify-between">
          {amountOptions.map((opt) => (
            <Button
              key={opt}
              variant="outline"
              className="flex-1 text-lg p-6 text-gray-400 rounded-full hover:bg-gray-200 bg-white"
              onClick={() => setAmount(Number(opt))}
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
    </div>
  );
}
