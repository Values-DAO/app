"use client";
import {Button} from "@/components/ui/button";

import {usePrivy} from "@privy-io/react-auth";
import {useUserContext} from "@/providers/user-context-provider";
import HomeComponent from "@/components/home-component";
import LoggedOutView from "@/components/logged-out-view";
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";

export default function Home() {
  const {authenticated, login, ready, user} = usePrivy();
  const {data: nextauth} = useSession();
  const {userInfo, isLoading} = useUserContext();
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    console.log(userInfo);
  }, [userInfo]);
  return (
    <>
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
          <span>Setting up your profile</span>
        </div>
      )}

      {authenticated || nextauth?.user ? (
        <>
          {isLoading && (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          {userInfo && <HomeComponent />}
        </>
      ) : (
        <>
          {ready ? (
            <div className="flex flex-col items-center px-6 mt-[40%] md:mt-[15%]">
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl">
                Collect your Values!
              </h1>
              <p className="leading-7 [&:not(:first-child)]:mt-6 text-center">
                Sign up and mint your values onchain.
              </p>
              <Button
                variant="default"
                onClick={() => {
                  setShowSignup(true);
                }}
                disabled={!ready || authenticated}
                className="my-4"
              >
                Get Started
              </Button>
              {showSignup && (
                <LoggedOutView
                  modalCloseHandler={() => {
                    setShowSignup(false);
                  }}
                  closeModalButton={true}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
        </>
      )}

      {}
    </>
  );
}
