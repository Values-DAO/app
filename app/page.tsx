"use client";
import {Button} from "@/components/ui/button";

import {usePrivy} from "@privy-io/react-auth";
import InviteCodeModal from "@/components/invite-code-modal";
import MintPage from "@/components/mint-page";
import {useUserContext} from "@/providers/user-context-provider";

export default function Home() {
  const {authenticated, login, ready, user} = usePrivy();
  const {userInfo, isLoading} = useUserContext();
  return (
    <>
      {isLoading && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {authenticated ? (
        <>
          {isLoading && (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          {userInfo && userInfo.isVerified === true && <MintPage />}
          {userInfo && userInfo.isVerified === false && (
            <div className="flex flex-col items-center px-6 mt-[40%] md:mt-[15%]">
              <InviteCodeModal />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center px-6 mt-[40%] md:mt-[15%]">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl">
            Collect your Values!
          </h1>
          <p className="leading-7 [&:not(:first-child)]:mt-6 text-center">
            Sign up and mint your values onchain.
          </p>
          <Button
            variant="default"
            onClick={login}
            disabled={!ready || authenticated}
            className="my-4"
          >
            Get Started
          </Button>
        </div>
      )}
    </>
  );
}
