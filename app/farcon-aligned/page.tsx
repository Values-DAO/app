"use client";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {usePrivy} from "@privy-io/react-auth";
import {ExclamationTriangleIcon} from "@radix-ui/react-icons";

import axios from "axios";

import React, {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
interface FarconPassHolder {
  username: string;
  address: string[];
  image: string;
  fid: string;
  alignment?: number;
  message?: string;
}
interface AlignmentPassHolder {
  fid: string;
  alignment: number;
  message?: string;
}
const FarconPage = () => {
  const [farconPassHolders, setFarconPassHolders] = useState<
    FarconPassHolder[]
  >([]);
  const [searchterm, setSearchterm] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<FarconPassHolder[]>([]);

  const {user} = usePrivy();
  const [isAPassHolder, setIsAPassHolder] = useState<boolean>(false);

  const [loader, setLoader] = useState<boolean>(false);
  const [mostAligned, setMostAligned] = useState<FarconPassHolder[] | null>(
    null
  );
  const mergeData = (
    farconPassHolders: FarconPassHolder[],
    alignmentPassHolders: AlignmentPassHolder[]
  ): FarconPassHolder[] => {
    const merged = farconPassHolders.map((farconPassHolder) => {
      const alignmentData = alignmentPassHolders.find(
        (alignment) => alignment.fid === farconPassHolder.fid
      );
      return {
        ...farconPassHolder,
        alignment: alignmentData?.alignment,
        message: alignmentData?.message,
      };
    });

    // Sorting the merged array by alignment in descending order
    merged.sort((a, b) => (b.alignment || 0) - (a.alignment || 0));
    return merged;
  };
  useEffect(() => {
    function searchByUsername(searchTerm: string) {
      if (searchTerm.length === 0) {
        setFilteredUsers(farconPassHolders);
      } else {
        if (farconPassHolders.length === 0) setFilteredUsers([]);
        else
          setFilteredUsers(
            farconPassHolders.filter((user: FarconPassHolder) =>
              user.username.toLowerCase().includes(searchTerm.toLowerCase())
            )
          );
      }
    }
    searchByUsername(searchterm);
  }, [searchterm, farconPassHolders]);
  useEffect(() => {
    const getHolders = async () => {
      setLoader(true);
      const holders = await axios.get("/api/farcon");

      if (holders.data) {
        if (user?.farcaster?.fid) {
          setIsAPassHolder(
            holders.data.users.some(
              (item: FarconPassHolder) =>
                Number(item.fid) === Number(user?.farcaster?.fid)
            )
          );
        }

        if (
          (user?.farcaster?.fid || user?.email?.address) &&
          holders.data.users &&
          holders.data.users.length > 0
        ) {
          const alignmentParam = user?.farcaster?.fid
            ? `fid=${user?.farcaster?.fid}`
            : `email=${user?.email?.address}`;
          const alignment = await axios.get(`/api/alignment?${alignmentParam}`);

          const mergedData = mergeData(
            holders.data.users,
            alignment.data.holders
          );
          setFarconPassHolders(mergedData);
          const positiveAlignmentHolders = mergedData
            .filter(
              (holder) =>
                (holder?.alignment || 0) > 0 &&
                holder.fid !== String(user?.farcaster?.fid || 0)
            )
            .slice(0, 3);
          setMostAligned(positiveAlignmentHolders);
        }
      } else {
        setFarconPassHolders(holders.data.users);
      }
      setLoader(false);
    };
    getHolders();
  }, [user]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2 ">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          The Farcon Pass Holders
        </h2>
        <Input
          placeholder="Search for a warpcast username"
          type="text"
          inputMode="text"
          value={searchterm}
          onChange={(e) => {
            setSearchterm(e.target.value);
          }}
          disabled={!isAPassHolder}
          className="border-white/10 bg-white/10 text-white/90"
        />
      </div>

      {isAPassHolder && !loader && mostAligned && mostAligned?.length > 0 && (
        <Card className="flex flex-col gap-2 p-4">
          <p className="font-semibold text-lg">Most ||aligned</p>
          <div className="flex flex-col md:flex-row gap-2 justify-evenly w-[100%] m-auto">
            {mostAligned.map((farconPassHolder, index) => {
              if (farconPassHolder.fid === String(user?.farcaster?.fid || 0))
                return;
              return (
                <Card key={index} className="w-full bg-gray-400/30">
                  <CardHeader>
                    <CardDescription className="text-white">
                      We Recommend you meet{" "}
                      <Link
                        className="text-primary hover:underline"
                        href={`https://warpcast.com/${farconPassHolder.username}`}
                        target="_blank"
                      >
                        {farconPassHolder.username}
                      </Link>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-row gap-4">
                      <Image
                        src={farconPassHolder.image}
                        alt={farconPassHolder.username}
                        width={50}
                        height={50}
                        className="rounded-full object-cover"
                      />
                      <div className="flex flex-col gap-2">
                        <p className="text-xl font-semibold tracking-tight">
                          {farconPassHolder.username}
                        </p>
                        <p className="text-primary">
                          {farconPassHolder.alignment?.toFixed(2)}% ||Aligned
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Card>
      )}
      {!loader && user?.farcaster?.fid === undefined && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Please login with your farcaster account to view the alignment.
          </AlertDescription>
        </Alert>
      )}
      {!loader && user?.farcaster?.fid && !isAPassHolder && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>You are not a farcon pass holder.</AlertDescription>
        </Alert>
      )}
      {loader && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      <p className="font-semibold text-lg">Everyone else</p>
      {filteredUsers &&
        filteredUsers
          .slice(mostAligned?.length ?? 0)
          .map((farconPassHolder, index) => {
            if (farconPassHolder.fid === String(user?.farcaster?.fid || 0))
              return;
            return (
              <Card
                className="px-4 py-2 flex flex-row gap-4 items-center rounded-md"
                key={index}
              >
                <Avatar>
                  <AvatarImage src={farconPassHolder.image} />
                  <AvatarFallback>{farconPassHolder.username}</AvatarFallback>
                </Avatar>
                <div className="flex-grow gap-2 ">
                  <p className="scroll-m-20 text-xl md:text-2xl font-semibold tracking-tight text-primary">
                    {farconPassHolder.username}
                  </p>
                  <div className="flex-row gap-2 flex-wrap my-1 hidden md:flex">
                    {farconPassHolder.address.length > 0 &&
                      farconPassHolder.address.map((address) => (
                        <Badge key={address} variant="secondary">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </Badge>
                      ))}
                  </div>{" "}
                </div>
                <Badge
                  variant="secondary"
                  className={`text-lg w-40 flex justify-center text-green-400 border-[1px] border-white/40 ${
                    !isAPassHolder && "blur-md"
                  }`}
                >
                  {farconPassHolder.alignment?.toFixed(2) || 0}% ||Aligned
                </Badge>
              </Card>
            );
          })}
    </div>
  );
};

export default FarconPage;
