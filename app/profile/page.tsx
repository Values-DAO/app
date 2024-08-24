"use client";

import {usePrivy} from "@privy-io/react-auth";
import {useUserContext} from "@/providers/user-context-provider";
import {Button} from "@/components/ui/button";
import ValueBadge from "@/components/ui/value-badge";
import {useEffect, useState} from "react";
import useValuesHook from "../hooks/useValuesHook";
import {NFT_CONTRACT_ADDRESS} from "@/constants";
import {Link as LinkIcon} from "lucide-react";
import Link from "next/link";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {ExclamationTriangleIcon} from "@radix-ui/react-icons";
import LoggedOutView from "@/components/logged-out-view";
import MintedValuesBar from "@/components/ui/minted-values-bar";

const ProfilePage = () => {
  const {authenticated, login, ready, user} = usePrivy();
  const {userInfo, isLoading, setUserInfo} = useUserContext();

  const {fetchUser} = useValuesHook();
  useEffect(() => {
    const fetchUserData = async () => {
      const user = (await fetchUser()).user;

      if (user) setUserInfo(user);
    };

    fetchUserData();
  }, [user]);

  return (
    <div className="p-4">
      {!isLoading && (
        <div>
          <h2 className="scroll-m-20 text-center border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-muted-foreground mb-2">
            || profile
          </h2>

          <div className="mt-4">
            <h3 className="flex items-center gap-2">
              <span className="font-semibold">
                Hello {user?.farcaster?.displayName}
              </span>{" "}
              {userInfo && (
                <Link
                  href={`https://opensea.io/assets/base/${NFT_CONTRACT_ADDRESS}/${userInfo.profileNft}`}
                  target="_blank"
                >
                  <LinkIcon className="m-0 p-0 text-primary" size={"18px"} />
                </Link>
              )}
            </h3>

            {userInfo &&
              userInfo.mintedValues &&
              userInfo.mintedValues.length > 0 && (
                <div>
                  <h3 className="font-medium mt-8 mb-2 text-3xl">
                    Minted Values
                  </h3>
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
                      {userInfo.mintedValues &&
                        userInfo.mintedValues
                          .sort(
                            (a, b) => Number(b.weightage) - Number(a.weightage)
                          )
                          .map((value) => (
                            <TableRow key={value.value}>
                              <TableCell className="font-medium">
                                <ValueBadge value={value.value} />
                              </TableCell>

                              <MintedValuesBar
                                weight={Number(value?.weightage) ?? 1}
                              />
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </div>
              )}

            {userInfo &&
              userInfo.mintedValues &&
              userInfo.mintedValues.length === 0 && (
                <Alert variant="destructive" className="mt-4">
                  <ExclamationTriangleIcon className="h-4 w-4" />

                  <AlertDescription>
                    You haven&apos;t minted any values yet.{" "}
                    <Link href="/">Click here to visit value mint page</Link>{" "}
                  </AlertDescription>
                </Alert>
              )}

            {userInfo &&
              userInfo?.attestations &&
              userInfo.attestations.length > 0 && (
                <Table className="border-[1px] border-gray-400   m-auto mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px] md:w-[200px] max-w-[400px]">
                        Attestations UID
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userInfo.attestations &&
                      userInfo.attestations.map((value: string) => (
                        <TableRow key={value}>
                          <TableCell className="font-medium">
                            <Button variant={"link"} asChild>
                              <Link
                                href={`https://base-sepolia.easscan.org/attestation/view/${value}`}
                                target="_blank"
                              >
                                {value}
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
          </div>
        </div>
      )}
      <LoggedOutView />
      {!ready ||
        (isLoading && (
          <section className="w-full mt-24  flex flex-col items-center ">
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
              <span>Loading</span>
            </div>
          </section>
        ))}
    </div>
  );
};

export default ProfilePage;
