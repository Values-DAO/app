import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface User {
  _id: string;
  userId: string;
  farcasterUsername?: string;
  twitterUsername?: string;
  alignmentScore?: number;
}

interface TrustPool {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  owners?: User[];
  members?: User[];
  communityLink?: string;
  twitterHandle?: string;
  farcasterHandle?: string;
  organizerTwitterHandle?: string;
}


const ShareButton = ({trustPool}: {trustPool: TrustPool | undefined}) => {
  if (!trustPool) {
    return null;
  }
  
  let link = ""
  switch (process.env.NEXT_PUBLIC_APP_ENV) {
    case "prod":
      link = `https://app.valuesdao.io/trustpools/${trustPool._id}`;
      break;
    case "staging":
      link = `https://staging.valuesdao.io/trustpools/${trustPool._id}`;
      break;
    case "dev":
      link = `http://localhost:3001/trustpools/${trustPool._id}`;
      break;
  }
  
  const text = encodeURIComponent(`Our community grows as you make lifetime connections with 3-10 people in the group. \n${trustPool.name} Trust Pool on ValuesDAO helps you find value-aligned people. \nJoin it: ${link}
    `);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Invite
          <ChevronDownIcon className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <a href={`https://twitter.com/intent/tweet?text=${text}`} target="_blank">
            Share on Twitter
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`https://warpcast.com/~/compose?text=${text}`}>
          Share on Farcaster</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;