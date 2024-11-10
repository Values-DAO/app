import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";

interface User {
  _id: string;
  userId: string;
  farcasterUsername?: string;
  twitterUsername?: string;
  alignmentScore?: number;
}

const ShareButton = ({user, type}: {user: User, type: string}) => {
  let text = "";
  
  function encodeTextForUrl(text: string): string {
    return encodeURIComponent(text);
  }
  
  switch (type) {
    case "align":
      text = encodeTextForUrl(`Hey @${user.twitterUsername}, apparently the ValuesDAO wizards did some alignment magic and decided we’re a perfect match—for world domination, or at least a solid conversation. Care to jump into DMs and see if these guys actually know what they’re talking about? 😄`);
      break;
    case "diverse":
      text =
        encodeTextForUrl(`Hey @${user.farcasterUsername}, ValuesDAO thinks we’re the yin and yang of value-alignment. We got diverse values. I would like to understand how you think. Want to DM and see if we’re more like fire and ice, or just two people who shouldn’t be left alone in the same room? 😄`);
      break;
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Connect
          <ChevronDownIcon className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {user.twitterUsername && (
          <DropdownMenuItem asChild>
            <a href={`https://twitter.com/intent/tweet?text=${text}`} target="_blank">
              <Image src="/x.svg" alt="x icon" height={16} width={16} className="mr-2" />
              Twitter
            </a>
          </DropdownMenuItem>
        )}
        {user.farcasterUsername && (
          <DropdownMenuItem asChild>
            <a href={`https://warpcast.com/~/compose?text=${text}`} target="_blank">
              <Image src="/farcaster.svg" alt="farcaster icon" height={16} width={16} className="mr-2" />
              Farcaster
            </a>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
