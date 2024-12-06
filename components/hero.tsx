"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ShareButton from "@/components/ShareButton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/constants";
import { useUserContext } from "@/providers/user-context-provider";
import { useCallback, useEffect, useState } from "react";
import type { TrustPool } from "@/types";
import { useRouter } from "next/navigation";
import axios from "axios";

const fetchTrustPool = async (trustPoolId: string): Promise<TrustPool> => {
  const response = await fetch(`${API_BASE_URL}/trustpools/find?trustPoolId=${trustPoolId}`);
  const data = await response.json();
  return data.data || {};
};

// This component is used to display the hero section of a trust pool page.
export default function Hero({ trustPoolId }: { trustPoolId: string }) {
  const { userInfo } = useUserContext();
  const [buttonText, setButtonText] = useState<string>("Loading...");
  const router = useRouter(); 
  const queryClient  = useQueryClient();

  const { data: trustPool, isLoading } = useQuery({
    queryKey: ["trustPool", trustPoolId],
    queryFn: () => fetchTrustPool(trustPoolId),
  });

  // Define callback and effect unconditionally
  const updateButtonText = useCallback(() => {
    if (!trustPool || !userInfo) return;
    const isOwner = trustPool.owners?.some((owner) => owner.userId === userInfo.userId);
    const isMember = trustPool.members?.some((member) => member.userId === userInfo.userId);
    setButtonText(isOwner ? "Edit" : isMember ? "Leave" : "Join");
  }, [trustPool, userInfo]);

  useEffect(() => {
    updateButtonText();
  }, [updateButtonText]);

  const handleJoinButton = async () => {
    const isOwner = trustPool?.owners?.some((owner) => owner.userId === userInfo?.userId);
    const isMember = trustPool?.members?.some((member) => member.userId === userInfo?.userId);

    if (isOwner) {
      router.push(`/trustpools/${trustPoolId}/edit`);
    } else if (isMember) {
      await axios.put(`${API_BASE_URL}/trustpools/join`, {
        userId: userInfo?.userId,
        trustPoolId,
        action: "leave",
      });
      setButtonText("Join");
    } else {
      await axios.put(`${API_BASE_URL}/trustpools/join`, {
        userId: userInfo?.userId,
        trustPoolId,
        action: "join",
      });
      setButtonText("Leave");
    }

    queryClient.invalidateQueries({ queryKey: ["trustPool", trustPoolId] });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 items-center justify-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        <h4 className="scroll-m-20 text-base font-light tracking-tight">Loading...</h4>
      </div>
    );
  }

  return (
    <section className="bg-primary py-4 text-primary-foreground rounded-lg mb-3 mx-2">
      <div className="px-4">
        <div className="flex flex-col items-center gap-3">
          <Image
            src={trustPool?.logo || "/valuesDAO.png"}
            alt={`${trustPool?.name || "Trust Pool"} logo`}
            width={80}
            height={80}
            className="rounded-full w-16 h-16 flex-shrink-0"
          />
          <div className="flex-1 text-center overflow-hidden">
            <div className="gap-3 flex justify-center items-center">
              <h1 className="mb-1 text-xl font-bold truncate">{trustPool?.name || "Trust Pool Name"}</h1>
              {trustPool?.communityLink && (
                <Link href={trustPool.communityLink} title="Community Link">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="size-7 cursor-pointer"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                    />
                  </svg>
                </Link>
              )}
              {trustPool?.twitterHandle && (
                <Link href={trustPool.twitterHandle}>
                  <Image src="/x.svg" alt="x icon" width={24} height={24} />
                </Link>
              )}
              {trustPool?.farcasterHandle && (
                <Link href={trustPool.farcasterHandle}>
                  <Image src="/farcaster.svg" alt="farcaster icon" width={24} height={24} />
                </Link>
              )}
            </div>
            {trustPool?.description && <p className="mb-2 text-sm break-words">{trustPool.description}</p>}
          </div>
          <div className="flex-shrink-0 flex gap-2">
            <Button variant="secondary" className="bg-white w-full mb-2 md:mb-0" onClick={handleJoinButton} size="sm">
              {buttonText}
            </Button>
            <ShareButton trustPool={trustPool} />
          </div>
        </div>
      </div>
    </section>
  );
}