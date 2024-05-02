"use client";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {usePrivy} from "@privy-io/react-auth";
import {ExclamationTriangleIcon} from "@radix-ui/react-icons";

import axios from "axios";

import React, {useEffect, useState} from "react";
interface FarconPassHolder {
  username: string;
  address: string[];
  image: string;
  fid: string;
}
const FarconPage = () => {
  const [farconPassHolders, setFarconPassHolders] = useState<
    FarconPassHolder[]
  >([]);
  const [searchterm, setSearchterm] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<FarconPassHolder[]>([]);
  const [alignment, setAlignment] = useState<any>({
    index: undefined,
    alignment: undefined,
  });
  const {user} = usePrivy();
  const [isAPassHolder, setIsAPassHolder] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const analyseAlignment = async (fid: string) => {
    const response = await axios.get(
      `api/alignment?email=${user?.email?.address}&fid=${fid}`
    );

    if (response.data.alignment) {
      setAlignment({
        index: fid,
        alignment: response.data.alignment,
      });
    } else {
      setAlignment({
        index: fid,
        alignment: "User has not minted any values.",
      });
    }
  };
  useEffect(() => {
    function searchByUsername(searchTerm: string) {
      if (searchTerm.length === 0) {
        setFilteredUsers(farconPassHolders);
      } else {
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
      const holders = await axios.get("/api/farcon");

      if (holders.data) {
        setFarconPassHolders(holders.data.users);
        setLoading(true);
        if (user?.farcaster?.fid) {
          setIsAPassHolder(
            holders.data.users.some(
              (item: FarconPassHolder) =>
                Number(item.fid) === Number(user?.farcaster?.fid)
            )
          );
        }
        setLoading(false);
      }
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

      {isAPassHolder &&
        filteredUsers &&
        filteredUsers.map((farconPassHolder, index) => {
          return (
            <div
              className="px-4 py-2 bg-gray-400/30 flex flex-row gap-4 items-center rounded-md"
              key={index}
            >
              <Avatar>
                <AvatarImage src={farconPassHolder.image} />
                <AvatarFallback>{farconPassHolder.username}</AvatarFallback>
              </Avatar>

              <div className="flex-grow gap-2 max-w-[60%] md:max-w-[90%]">
                <p className="scroll-m-20 text-2xl font-semibold tracking-tight text-primary">
                  {farconPassHolder.username}
                </p>

                <div className="flex flex-row gap-2 flex-wrap my-1">
                  {farconPassHolder.address.length > 0 &&
                    farconPassHolder.address.map((address) => (
                      <Badge key={address} variant="secondary">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </Badge>
                    ))}
                </div>
              </div>
              {alignment.index === farconPassHolder.fid ? (
                <Badge
                  variant={
                    !isNaN(parseFloat(alignment.alignment)) &&
                    isFinite(alignment.alignment)
                      ? "default"
                      : "destructive"
                  }
                  className={`text-md md:text-xl w-48 md:min-w-48 md:w-[fit-content] py-2 text-center justify-center text-white ${
                    !isNaN(parseFloat(alignment.alignment)) &&
                    isFinite(alignment.alignment)
                      ? "bg-green-500/60"
                      : "destructive"
                  } `}
                >
                  {isNaN(parseFloat(alignment.alignment))
                    ? "User hasn't minted any values"
                    : alignment.alignment + "%"}
                </Badge>
              ) : (
                <Button
                  variant={"default"}
                  className="w-48"
                  onClick={() => {
                    analyseAlignment(farconPassHolder.fid);
                  }}
                >
                  Find Alignment
                </Button>
              )}
            </div>
          );
        })}

      {!isAPassHolder && !loading && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            You don&apos;t have a Farcon Pass.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FarconPage;
