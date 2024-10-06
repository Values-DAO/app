"use client";
import React from "react";

import {Button} from "../ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {EllipsisVertical} from "lucide-react";
import {useLogout, usePrivy} from "@privy-io/react-auth";
import {useUserContext} from "@/providers/user-context-provider";
import {AlignmentSearchSheet} from "../alignment-search-sheet";
import {usePathname} from "next/navigation";

const Navbar = () => {
  const {ready, authenticated, login} = usePrivy();
  const {setUserInfo} = useUserContext();
  const pathname = usePathname();
  const {logout} = useLogout({
    onSuccess: () => {
      setUserInfo(null);
    },
  });
  return (
    <div className="flex flex-row justify-between items-center  p-4 md:p-6 relative">
      <Link href="/">
        <img
          src={"/logo.png"}
          alt="logo"
          className="w-[200px] h-[40px] md:w-[300px] md:h-[60px] cursor-pointer"
        />
      </Link>

      <div className="hidden md:flex flex-row gap-4 mt-[-12px]">
        {pathname === "/" && (
          <AlignmentSearchSheet buttonText="Check Alignment w/ Farcaster user" />
        )}
        {ready && authenticated ? (
          <Button variant={"secondary"} onClick={logout}>
            Logout
          </Button>
        ) : (
          <Button onClick={login} disabled={!ready}>
            Login
          </Button>
        )}
      </div>
      <div className=" flex flex-row gap-2  md:hidden mt-[-12px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="p-2 border-[2px] border-gray-500/45 rounded-md">
              <EllipsisVertical size={"25px"} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-4">
            {authenticated ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => logout()}
              >
                Logout
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => login()}
              >
                Login
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;
