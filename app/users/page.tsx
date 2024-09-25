"use client";
import UserDataTable from "@/components/users-table";
import {usePrivy} from "@privy-io/react-auth";
import React from "react";

const UsersPage = () => {
  const {user, ready, authenticated} = usePrivy();
  const isAdmin = () => {
    const admins = process.env.NEXT_PUBLIC_ADMINS?.split(",");
    if (admins && admins.includes(String(user?.farcaster?.fid!))) {
      return true;
    }
    return false;
  };
  return (
    <>
      {ready && authenticated && isAdmin() && <UserDataTable />}
      {!ready && authenticated && !isAdmin() && (
        <div className="flex flex-1 justify-center items-center">
          <h1>Unauthorized</h1>
        </div>
      )}
      {!ready && (
        <div className="flex flex-col gap-2 items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
          <h4 className="scroll-m-20 text-lg font-light tracking-tight">
            Loading...
          </h4>
        </div>
      )}
    </>
  );
};

export default UsersPage;
