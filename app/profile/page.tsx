"use client";

import InviteCodeModal from "@/components/invite-code-modal";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {toast} from "@/components/ui/use-toast";
import {IUser} from "@/models/user";
import {usePrivy} from "@privy-io/react-auth";
import {Copy} from "lucide-react";
import {useEffect, useState} from "react";
import useValues from "../hooks/useValues";
import {useUserContext} from "@/providers/user-context-provider";
import ExperimentalBurnButtons from "@/components/ui/experimental-burn-buttons";
const ProfilePage = () => {
  const {authenticated, login, ready, user} = usePrivy();
  const {userInfo, isLoading} = useUserContext();
  return (
    <div className="p-4">
      {authenticated && userInfo && !isLoading && (
        <div>
          <h2 className="scroll-m-20 text-center border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-muted-foreground mb-2">
            || minted values
          </h2>
          <ExperimentalBurnButtons />
          {userInfo &&
            userInfo.mintedValues &&
            userInfo.mintedValues.length === 0 && (
              <Card className="mt-2">
                <p className="text-center">No minted values yet</p>
              </Card>
            )}
          {userInfo &&
            userInfo.mintedValues &&
            userInfo.mintedValues.length > 0 && (
              <Card className="mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]"> Values</TableHead>
                      <TableHead className="w-full">tx hash</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userInfo.mintedValues.map((value: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium truncate w-[30%]">
                          {value.value}
                        </TableCell>
                        <TableCell className="font-medium truncate">
                          <Button
                            variant="link"
                            className="m-0 p-0 h-2"
                            onClick={() => {
                              window.open(
                                `${process.env.NEXT_PUBLIC_BASESCAN_URL}/tx/${value.txHash}`,
                                "_blank"
                              );
                            }}
                          >
                            {`${value.txHash.substring(
                              0,
                              5
                            )}...${value.txHash.slice(-5)}`}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
        </div>
      )}

      {!authenticated && (
        <section className="w-full mt-24 md:mt-[15%]  flex flex-col items-center ">
          <span className="font-semibold  text-gray-300 text-lg">
            Login to view
          </span>
          <Button
            variant="default"
            onClick={login}
            disabled={!ready || authenticated || isLoading}
            className="my-4"
          >
            {isLoading ? "Loading.." : "Login"}
          </Button>
        </section>
      )}
    </div>
  );
};

export default ProfilePage;
