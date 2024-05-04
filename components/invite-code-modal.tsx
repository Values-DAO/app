"use client";

import React, {useState} from "react";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {usePrivy} from "@privy-io/react-auth";
import {REGEXP_ONLY_DIGITS_AND_CHARS} from "input-otp";
import {Button} from "./ui/button";
import {Twitter} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "./ui/alert";
import {ExclamationTriangleIcon} from "@radix-ui/react-icons";
import {Input} from "./ui/input";
import Image from "next/image";
interface InviteCodeModalProps {
  setVerified: React.Dispatch<React.SetStateAction<boolean>>;
}
const InviteCodeModal: React.FC<InviteCodeModalProps> = ({setVerified}) => {
  const [value, setValue] = useState("");
  const {user, linkEmail} = usePrivy();
  const [showInvalidCode, setShowInvalidCode] = useState(false);
  const isValid = async () => {
    const response = await fetch(
      `/api/validate-code?code=${value}&email=${user?.email?.address}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_NEXT_API_KEY as string,
        },
      }
    );
    const data = await response.json();
    if (data.isValid) {
      setVerified(true);
    } else {
      setShowInvalidCode(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 mb-12">
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
        We are invite only at the moment!
      </h3>{" "}
      {user?.email?.address && (
        <>
          {" "}
          <p className="text-sm text-muted-foreground">
            Enter your invite code
          </p>
          <InputOTP
            maxLength={6}
            value={value}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            type="text"
            inputMode="text"
            onChange={(value) => {
              setValue(value);
              setShowInvalidCode(false);
            }}
            onComplete={isValid}
          >
            <InputOTPGroup>
              <InputOTPSlot
                className="h-12 w-12 text-lg border-white/70"
                index={0}
              />
              <InputOTPSlot
                className="h-12 w-12 text-lg border-white/70"
                index={1}
              />
              <InputOTPSlot
                className="h-12 w-12 text-lg border-white/70"
                index={2}
              />
              <InputOTPSlot
                className="h-12 w-12 text-lg border-white/70"
                index={3}
              />
              <InputOTPSlot
                className="h-12 w-12 text-lg border-white/70"
                index={4}
              />
              <InputOTPSlot
                className="h-12 w-12 text-lg border-white/70"
                index={5}
              />
            </InputOTPGroup>
          </InputOTP>
        </>
      )}
      {!user?.email?.address && (
        <Button onClick={linkEmail} className="">
          Link Email
        </Button>
      )}
      {showInvalidCode && (
        <Alert variant="destructive" className="my-2 max-w-lg">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Invalid code. Please check the code and try again.
          </AlertDescription>
        </Alert>
      )}
      <blockquote className="mt-24 border-l-2 pl-6 italic">
        Post a tweet if you don&apos;t have an invite code. We have limited
        spots but if you&apos;re ||aligned, we or one of our partner communities
        will give you an invite
      </blockquote>
      <div className="flex   flex-row gap-2">
        <Button
          className="flex flex-row w-full"
          variant={"secondary"}
          onClick={() => {
            window.open(
              "https://twitter.com/intent/tweet?url=https%3A%2F%2Fapp.valuesdao.io%2F&text=brb%20checking%20how%20%7C%7Caligned%20my%20twitter%20friends%20are%20%20any%20%7C%7Caligned%20friends%20on%20my%20timeline%20have%20an%20invite%20to%20ValuesDAO%3F",
              "_blank"
            );
          }}
        >
          Tweet
          <Twitter strokeWidth={0} fill="#1DA1F2" className="h-6 w-6 ml-2" />
        </Button>{" "}
        <Button
          className="flex flex-row w-full"
          variant={"secondary"}
          onClick={() => {
            window.open(
              "https://warpcast.com/~/compose?text=brb%20checking%20how%20%7C%7Caligned%20my%20twitter%20friends%20are%20%20any%20%7C%7Caligned%20friends%20on%20my%20timeline%20have%20an%20invite%20to%20ValuesDAO%3F%20&embeds[]=https://warpcast.com/~/channel/valuesdao&embeds[]=https://app.valuesdao.io",
              "_blank"
            );
          }}
        >
          Share
          <Image
            src="/white-purple.png"
            width={20}
            height={20}
            alt="farcaster"
            className="mx-2"
          />
        </Button>
      </div>
    </div>
  );
};
export default InviteCodeModal;
