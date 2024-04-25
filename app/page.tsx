"use client";
import {Button} from "@/components/ui/button";
import MintPage from "./mint/page";
import {usePrivy} from "@privy-io/react-auth";

export default function Home() {
  const {authenticated, login, ready} = usePrivy();
  return (
    <>
      {authenticated ? (
        <MintPage />
      ) : (
        <div className="flex flex-col items-center px-6 mt-[40%] md:mt-[15%]">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl">
            Collect you Values!
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
