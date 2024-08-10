import React from "react";
import {Card, CardDescription, CardTitle} from "./ui/card";
import {Button} from "./ui/button";
import {usePrivy} from "@privy-io/react-auth";
import {signIn, useSession} from "next-auth/react";
import Image from "next/image";
import {X} from "lucide-react";

const LoggedOutView = ({
  closeModalButton,
  modalCloseHandler,
}: {
  closeModalButton?: boolean;
  modalCloseHandler?: () => void;
}) => {
  const {ready, login, authenticated} = usePrivy();
  const {data: session, status} = useSession();
  const loading = status === "loading";
  return (
    <>
      {ready && !authenticated && !session ? (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-500 bg-opacity-25 backdrop-blur-sm">
          <Card className="relative w-[300px] md:w-[400px] h-[300px] md:h-[400px] p-6 flex flex-col justify-center items-center gap-4">
            {closeModalButton && (
              <div className="absolute top-5 right-5">
                <X onClick={modalCloseHandler} className="cursor-pointer" />
              </div>
            )}
            <CardTitle className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-4">
              Login to continue
            </CardTitle>
            <CardDescription className="flex flex-col gap-2 items-center mt-12">
              <Button onClick={login} disabled={!ready} className="w-full">
                {ready ? "Login with other methods" : "Loading..."}
              </Button>
              <Button
                className="bg-black text-white w-full hover:bg-black"
                onClick={(e) => {
                  e.preventDefault();
                  signIn("worldcoin");
                }}
                disabled={loading}
              >
                <Image
                  src={"/worldlogo.png"}
                  width={50}
                  height={50}
                  alt="worldcoin logo"
                />{" "}
                Sign in with World ID
              </Button>
            </CardDescription>
          </Card>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default LoggedOutView;
