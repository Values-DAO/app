// components/TokenDashboard/TokenHeader.tsx
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Clipboard } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/utils";

interface TokenHeaderProps {
  userInfo: any; // Replace with proper type
  embeddedWallet: any; // Replace with proper type
  isLoading: boolean;
  balance: string;
}

export function TokenHeader({ userInfo, embeddedWallet, isLoading, balance }: TokenHeaderProps) {
  const { exportWallet } = usePrivy();
  const [copied, setCopied] = useState(false);
  const [userBalance, setUserBalance] = useState("0");
  
  useEffect(() => {
    if (balance) {
      setUserBalance(balance);
    }
  }, [balance]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between gap-x-3 w-full">
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-8 flex-1 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    );
  }

  const displayName = userInfo?.farcasterUsername || userInfo?.twitterUsername || userInfo?.email || "Guest";

  const handleCopy = () => {
    if (embeddedWallet?.address) {
      navigator.clipboard.writeText(embeddedWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="flex items-center justify-between gap-x-3 w-full">
      <div className="flex-shrink-0 flex items-center bg-white rounded-full px-2 py-1">
        <div className="flex-shrink-0 flex items-center justify-center rounded-full bg-background text-black font-semibold w-6 h-6 mr-2">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="truncate min-w-0 w-20">{displayName}</div>
      </div>

      <div className="flex-1 flex items-center justify-between bg-white rounded-full px-2 py-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 py-1 px-2"
          onClick={exportWallet}
        >
          <ChevronDown />
        </Button>
        <div className="truncate mx-2 text-gray-800 min-w-0">{embeddedWallet?.address || "..."}</div>
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 py-1 px-2"
          onClick={handleCopy}
        >
          <Clipboard />
        </Button>
      </div>

      <div className="flex-shrink-0 bg-white rounded-full px-2 py-1 flex items-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 18C18.4183 18 22 14.4183 22 10C22 5.58172 18.4183 2 14 2C9.58172 2 6 5.58172 6 10C6 14.4183 9.58172 18 14 18Z"
            stroke="#141B34"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M3.15657 11C2.42523 12.1176 2 13.4535 2 14.8888C2 18.8162 5.18378 22 9.11116 22C10.5465 22 11.8824 21.5748 13 20.8434"
            stroke="#141B34"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="ml-2">{formatNumber(userBalance) || "..."}</span>
      </div>
    </div>
  );
}
