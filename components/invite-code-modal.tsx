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
import useValues from "@/app/hooks/useValues";
import Link from "next/link";
interface InviteCodeModalProps {
  onSuccess: () => void;
}

const InviteCodeModal: React.FC<InviteCodeModalProps> = ({onSuccess}) => {
  const [value, setValue] = useState("");
  const {user, linkEmail} = usePrivy();
  const [showInvalidCode, setShowInvalidCode] = useState(false);
  const {validateInviteCode} = useValues();

  const isValid = async () => {
    const isValid = await validateInviteCode({
      inviteCode: value,
    });
    if (isValid) onSuccess();
    if (!isValid) {
      setShowInvalidCode(true);
      setValue("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 mb-12">
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
        We are invite only at the moment!
      </h3>
      {(user?.email?.address || user?.farcaster?.fid) && (
        <>
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
        <Link
          href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fapp.valuesdao.io%2F&text=brb%20checking%20how%20%7C%7Caligned%20my%20twitter%20friends%20are%20%20any%20%7C%7Caligned%20friends%20on%20my%20timeline%20have%20an%20invite%20to%20ValuesDAO%3F"
          target="_blank"
        >
          <Button className="flex flex-row w-full" variant={"secondary"}>
            Tweet
            <Twitter strokeWidth={0} fill="#1DA1F2" className="h-6 w-6 ml-2" />
          </Button>
        </Link>
        <Link
          href="https://warpcast.com/~/compose?text=brb%20checking%20how%20%7C%7Caligned%20my%20twitter%20friends%20are%20%20any%20%7C%7Caligned%20friends%20on%20my%20timeline%20have%20an%20invite%20to%20ValuesDAO%3F%20&embeds[]=https://warpcast.com/~/channel/valuesdao&embeds[]=https://app.valuesdao.io"
          target="_blank"
        >
          <Button className="flex flex-row w-full" variant={"secondary"}>
            Share
            <Image
              src="/white-purple.png"
              width={20}
              height={20}
              alt="farcaster"
              className="mx-2"
            />
          </Button>
        </Link>
      </div>
    </div>
  );
};
export default InviteCodeModal;
