"use client";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ValueBadge from "@/components/ui/value-badge";
import {NFT_CONTRACT_ADDRESS} from "@/constants";
import {GetFIDForUsername} from "@/lib/get-username-fid";
import {IUser} from "@/models/user";
import {ExclamationTriangleIcon} from "@radix-ui/react-icons";
import axios from "axios";
import {LinkIcon} from "lucide-react";
import Link from "next/link";
import React, {useEffect, useState} from "react";

const PublicProfile = ({params: {id}}: {params: {id: string}}) => {
  const [user, setUser] = useState<IUser | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const findUser = async (id: string) => {
    let fid = null;
    setLoading(true);
    if (isNaN(Number(id))) {
      fid = await GetFIDForUsername(id);
    } else {
      fid = id;
    }

    if (fid === null) {
      setError("User not found");
      setLoading(false);
    }
    if (fid !== null || fid !== undefined) {
      const {data} = await axios.get(`/api/v2/user/?fid=${fid}`, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY,
        },
      });

      setUser(data.user);
    }
    setLoading(false);
  };

  useEffect(() => {
    findUser(id);
  }, [id]);
  return (
    <div className="p-4">
      {user && (
        <div className="mt-4">
          <h3 className="flex gap-2 flex-col">
            <span className="font-semibold">User : {id}</span>{" "}
            <Link
              href={`https://opensea.io/assets/base/${NFT_CONTRACT_ADDRESS}/${user.profileNft}`}
              target="_blank"
              className="flex flex-row gap-2 items-center"
            >
              Profile NFT:{" "}
              <LinkIcon className="m-0 p-0 text-primary" size={"18px"} />
            </Link>
          </h3>

          {user.mintedValues && user.mintedValues.length > 0 ? (
            <Table className="border-[1px] border-gray-400   m-auto mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] md:w-[200px] max-w-[400px]">
                    Value
                  </TableHead>

                  <TableHead>Weight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.mintedValues &&
                  user.mintedValues
                    .sort((a, b) => Number(b.weightage) - Number(a.weightage))
                    .map((value) => (
                      <TableRow key={value.value}>
                        <TableCell className="font-medium">
                          <ValueBadge value={value.value} />
                        </TableCell>

                        <TableCell>{Number(value?.weightage) ?? 1}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          ) : (
            <Alert variant="destructive" className="mt-4">
              <ExclamationTriangleIcon className="h-4 w-4" />

              <AlertDescription>
                User haven&apos;t minted any values yet.{" "}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      {error && !user && (
        <Alert variant="destructive" className="mt-4 flex items-center">
          <ExclamationTriangleIcon className="h-4 w-4" />

          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PublicProfile;
