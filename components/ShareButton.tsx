import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";


const ShareButton = () => {
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
          <a
            href={`https://twitter.com/intent/tweet?text=Hey%20@$%2C%20apparently%20the%20@ValuesDAO%20wizards%20did%20some%20alignment%20magic%20and%20decided%20we%E2%80%99re%20a%20perfect%20match%E2%80%94for%20world%20domination%2C%20or%20at%20least%20a%20solid%20conversation.%0ACare%20to%20jump%20into%20DMs%20and%20see%20if%20these%20guys%20actually%20know%20what%20they%E2%80%99re%20talking%20about%3F%20%F0%9F%98%84`}
            target="_blank"
          >
            Share on Twitter
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`https://warpcast.com/compose?text=Hey%20@$%2C%20apparently%20the%20@ValuesDAO%20wizards%20did%20some%20alignment%20magic%20and%20decided%20we%E2%80%99re%20a%20perfect%20match%E2%80%94for%20world%20domination%2C%20or%20at%20least%20a%20solid%20conversation.%0ACare%20to%20jump%20into%20DMs%20and%20see%20if%20these%20guys%20actually%20know%20what%20they%E2%80%99re%20talking%20about%3F%20%F0%9F%98%84`}
            target="_blank"
          >
            Share on Farcaster
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;