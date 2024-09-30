"use client";
import AiValueComponent from "@/components/ai-value-component";
import {Button} from "@/components/ui/button";
import SpectrumCard from "@/components/ui/spectrum-card";
import ValuesWordCloud from "@/components/word-cloud";
import {SPECTRUMS} from "@/constants";
import {useUserContext} from "@/providers/user-context-provider";
import {usePrivy} from "@privy-io/react-auth";
import Image from "next/image";

export default function Home() {
  const {userInfo, isLoading} = useUserContext();
  const {authenticated, ready, login} = usePrivy();
  return (
    <main className="mt-8">
      {!isLoading && (
        <>
          {authenticated && <ValuesWordCloud />}
          {authenticated && <AiValueComponent />}
          {ready && !authenticated && (
            <div className="flex flex-col items-center px-6 mt-12">
              <div
                className={`grid md:grid-cols-3 gap-2 my-4 mb-12 ${
                  window.innerWidth > 768 ? "grid-cols-2" : "grid-cols-1"
                }`}
              >
                {Array(window.innerWidth > 768 ? 3 : 1)
                  .fill(1)
                  .map((_, index) => (
                    <SpectrumCard
                      key={index}
                      name={SPECTRUMS[index]}
                      score={Math.random() * 100}
                      description="Description"
                    />
                  ))}
              </div>
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-6xl text-center">
                Collect your Values!
              </h1>
              <p className="leading-7 [&:not(:first-child)]:mt-6 text-center">
                Mint your Values onchain.
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
      )}

      {ready && isLoading && (
        <div className="flex flex-col gap-2 items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
          <h4 className="scroll-m-20 text-lg font-light tracking-tight">
            Setting up your Profile..
          </h4>
        </div>
      )}

      {!ready && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-opacity-50 backdrop-filter backdrop-blur-lg">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
          <h4 className="scroll-m-20 text-lg font-light tracking-tight">
            Loading...
          </h4>
        </div>
      )}
    </main>
  );
}
