"use client";
import Image from "next/image";
import React, {useState, useEffect} from "react";

import {Button} from "../ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {EllipsisVertical} from "lucide-react";
import {usePrivy} from "@privy-io/react-auth";
import {signOut, useSession} from "next-auth/react";

const Navbar = () => {
  const {ready, authenticated, user, logout, login} = usePrivy();
  const {data: nextauth} = useSession();
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
        <Button variant={"link"} className="text-md" asChild>
          <Link href={"/"}>Home</Link>
        </Button>
        {/* <Button variant={"link"} className="text-md" asChild>
          <Link href={"/farcaster-meetup"}>Farcaster Meetup SF</Link>
        </Button> */}
        {/* <Button variant={"link"} className="text-md" asChild>
          <Link href={"/farcon-aligned"}>Farcon</Link>
        </Button> */}
        <Button variant={"link"} className="text-md" asChild>
          <Link href={"/community"}>Communities</Link>
        </Button>{" "}
        <Button variant={"link"} className="text-md" asChild>
          <Link href={"/profile"}>Profile</Link>
        </Button>
        {/* <Button variant={"link"} className="text-md" asChild>
          <Link href={"/mint"}>Mint a Value</Link>
        </Button> */}
        {(ready && authenticated) || nextauth?.user ? (
          <Button
            variant={"default"}
            onClick={() => {
              if (nextauth?.user) {
                signOut();
                logout();
              } else {
                logout();
              }
            }}
          >
            Logout
          </Button>
        ) : (
          typeof window !== "undefined" &&
          window.location.pathname !== "/" && (
            <Button onClick={login} disabled={!ready}>
              Login
            </Button>
          )
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
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={"/"}>Home</Link>
            </DropdownMenuItem>
            {/* <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={"/farcaster-meetup"}>Farcaster Meetup SF</Link>
            </DropdownMenuItem> */}
            {/* <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={"/farcon-aligned"}>Farcon</Link>
            </DropdownMenuItem> */}
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={"/community"}>Communities</Link>
            </DropdownMenuItem>{" "}
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={"/profile"}>Profile</Link>
            </DropdownMenuItem>
            {/* <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={"/mint"}>Mint a Value</Link>
            </DropdownMenuItem> */}
            {authenticated && nextauth?.user ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  if (nextauth?.user) {
                    signOut();
                    logout();
                  } else {
                    logout();
                  }
                }}
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
