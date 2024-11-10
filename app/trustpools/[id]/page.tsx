"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Twitter } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserContext } from "@/providers/user-context-provider";
import { API_BASE_URL } from "@/constants";
import axios from "axios";
import ShareButton from "@/components/ShareButton";

// Type definitions
interface User {
  _id: string;
  userId: string;
  farcasterUsername?: string;
  twitterUsername?: string;
  alignmentScore?: number;
}

interface TrustPool {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  owners?: User[];
  members?: User[];
  communityLink?: string;
  twitterHandle?: string;
  farcasterHandle?: string;
  organizerTwitterHandle?: string;
}

// Fetch functions 
const fetchTrustPool = async (trustPoolId: string): Promise<TrustPool> => {
  const response = await fetch(`${API_BASE_URL}/trustpools/find?trustPoolId=${trustPoolId}`);
  const data = await response.json();
  return data.data || [];
};

const fetchAlignedUsers = async ({ trustPoolId, userId }: { trustPoolId: string; userId: string }) => {
  const response = await fetch(`${API_BASE_URL}/trustpools/alignment?trustPoolId=${trustPoolId}&userId=${userId}`);
  const data = await response.json();
  return data.data || [];
};

const fetchSearchResults = async ({
  trustPoolId,
  username,
}: {
  trustPoolId: string;
  username: string;
}): Promise<User[]> => {
  if (!username) return [];
  const response = await fetch(`${API_BASE_URL}/trustpools/userSearch?trustPoolId=${trustPoolId}&username=${username}`);
  const data = await response.json();
  return data.data || [];
};

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default function Dashboard({ params }: { params: { id: string } }) {
  const trustPoolId = params.id!;
  const router = useRouter();
  const { userInfo } = useUserContext();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 150);
  const [buttonText, setButtonText] = useState<string>("");

  // Queries 
  const { data: trustPool, isLoading: isLoadingPool } = useQuery({
    queryKey: ["trustPool", trustPoolId],
    queryFn: () => fetchTrustPool(trustPoolId),
  });

  const { data: alignedUsers, isLoading: isLoadingAlignment } = useQuery({
    queryKey: ["alignedUsers", trustPoolId, userInfo?.userId],
    queryFn: () => fetchAlignedUsers({ trustPoolId, userId: userInfo?.userId! }),
    enabled: !!userInfo?.userId,
  });

  const { data: searchResults } = useQuery({
    queryKey: ["searchResults", trustPoolId, debouncedSearch],
    queryFn: () => fetchSearchResults({ trustPoolId, username: debouncedSearch }),
    enabled: !!debouncedSearch,
  });

  const updateButtonText = useCallback(() => {
    if (!trustPool || !userInfo) return;
    const isOwner = trustPool.owners?.some((owner) => owner.userId === userInfo.userId);
    const isMember = trustPool.members?.some((member) => member.userId === userInfo.userId);
    setButtonText(isOwner ? "Edit" : isMember ? "Leave" : "Join");
  }, [trustPool, userInfo]);

  const handleAlignmentPage = (username: string) => {
    if (!userInfo) return;
    if (username.length === 0) return;
    router.push(`/user-alignment?=${userInfo?.twitterUsername || userInfo?.farcasterUsername}&target=${username}`);
  };

  useEffect(() => {
    updateButtonText();
  }, [updateButtonText]);

  const handleJoinButton = async () => {
    const isOwner = trustPool?.owners?.some((owner) => owner.userId === userInfo?.userId);
    const isMember = trustPool?.members?.some((member) => member.userId === userInfo?.userId);

    if (isOwner) {
      setButtonText("Edit");
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

    // @ts-ignore 
    queryClient.invalidateQueries(["trustPool", trustPoolId]);
  };
  
  const handleCommunity = () => {
    if (trustPool?.communityLink) {
      router.push(trustPool?.communityLink);
    } else {
      alert("No community link found.");
    }
  }

  const renderUserList = () => {
    if (searchTerm) {
      return searchResults?.map((user) => (
        <li
          key={user._id}
          className="flex items-center justify-between p-2 border-b cursor-pointer"
          onClick={() => handleAlignmentPage(user.farcasterUsername || user.twitterUsername || "")}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{user.farcasterUsername || user.twitterUsername}</span>
            <Badge variant="outline" className="text-xs">
              {trustPool?.owners?.some((owner) => owner.userId === user.userId) ? "Creator" : "Member"}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {user.twitterUsername && (
              <Button size="sm" variant="outline" asChild>
                <Link href={`https://twitter.com/${user.twitterUsername}`} target="_blank">
                  <Image src="/x.svg" alt="x icon" height={16} width={16} />
                </Link>
              </Button>
            )}
            {user.farcasterUsername && (
              <Button size="sm" className="bg-[#9c6bff] text-white hover:bg-[#7c4dff]" asChild>
                <Link href={`https://warpcast.com/${user.farcasterUsername}`} target="_blank">
                  <Image src="/farcaster.svg" alt="farcaster icon" height={16} width={16} />
                </Link>
              </Button>
            )}
          </div>
        </li>
      ));
    }

    const combinedUsers = [...(trustPool?.owners || []), ...(trustPool?.members || [])].slice(0, 10);

    return combinedUsers.map((user, index) => (
      <li
        key={user._id || index}
        className="flex items-center justify-between p-2 border-b cursor-pointer"
        onClick={() => handleAlignmentPage(user.farcasterUsername || user.twitterUsername || "")}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{user.farcasterUsername || user.twitterUsername}</span>
          {index === 0 && <Badge className="text-xs">Creator</Badge>}
        </div>
        <div className="flex items-center gap-1">
          {user.twitterUsername && (
            <Button size="sm" variant="outline" asChild>
              <Link
                href={`https://twitter.com/${user.twitterUsername}`}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                <Image src="/x.svg" alt="x icon" height={16} width={16} />
              </Link>
            </Button>
          )}
          {user.farcasterUsername && (
            <Button size="sm" className="bg-[#855DCD] text-white hover:bg-[#9770df]" asChild>
              <Link
                href={`https://warpcast.com/${user.farcasterUsername}`}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                <Image src="/farcaster.svg" alt="farcaster icon" height={16} width={16} />
              </Link>
            </Button>
          )}
        </div>
      </li>
    ));
  };

  const AlignmentSkeleton = () => (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-6" />
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoadingPool) {
    return (
      <div className="flex flex-col gap-2 items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        <h4 className="scroll-m-20 text-base font-light tracking-tight">Loading...</h4>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background md:container">
      {/* Hero Section */}
      <section className="bg-primary py-4 sm:py-6 text-primary-foreground rounded-lg mb-3 mx-2">
        <div className="px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col items-center gap-3 sm:gap-4 md:flex-row md:items-start">
            <Image
              src={trustPool?.logo || "/valuesDAO.png"}
              alt={`${trustPool?.name || "Trust Pool"} logo`}
              width={80}
              height={80}
              className="rounded-full w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0"
            />
            <div className="flex-1 text-center md:text-left overflow-hidden">
              <div className="gap-3 flex justify-center items-center">
                <h1 className="mb-1 text-xl sm:text-2xl font-bold md:text-3xl truncate">
                  {trustPool?.name || "Trust Pool Name"}
                </h1>
                <div title="Community Link" onClick={handleCommunity}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    className="size-7 cursor-pointer"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                    />
                  </svg>
                </div>
                {trustPool?.twitterHandle && (
                  <div>
                    <Link href={trustPool?.twitterHandle}>
                      <Image src={"/x.svg"} alt={"x icon"} width={24} height={24} />
                    </Link>
                  </div>
                )}
                {trustPool?.farcasterHandle && (
                  <div>
                    <Link href={trustPool?.farcasterHandle}>
                      <Image src={"/farcaster.svg"} alt={"farcaster icon"} width={24} height={24} />
                    </Link>
                  </div>
                )}
              </div>
              <p className="mb-2 text-xs sm:text-sm md:text-base break-words">
                {trustPool?.description ||
                  "Trust Pool description goes here. This is a placeholder text that will be replaced with the actual description of the trust pool."}
              </p>
            </div>
            <div className="mt-2 md:mt-0 flex-shrink-0 flex flex-row md:flex-col md:space-y-2 gap-2">
              <Button variant="secondary" className="bg-white w-full mb-2 md:mb-0" onClick={handleJoinButton} size="sm">
                {buttonText || "Join Pool"}
              </Button>
              {/* {trustPool?.twitterHandle && (
                <Button
                  variant="secondary"
                  className="border-black font-semibold w-full mb-2 md:mb-0 pr-6"
                  size="sm"
                  asChild
                >
                  <Link href={`${trustPool?.twitterHandle || ""}`} target="_blank">
                    <Image src="/x.svg" alt="x icon" height={24} width={24} className="pl-2" />
                    Twitter
                  </Link>
                </Button>
              )}
              {trustPool?.farcasterHandle && (
                <Button
                  variant="secondary"
                  className="pr-6 hover:bg-[#967fda] bg-[#855DCD] border-[#855DCD] text-white font-semibold w-full mb-2 md:mb-0"
                  size="sm"
                  asChild
                >
                  <Link href={`${trustPool?.farcasterHandle || ""}`} target="_blank">
                    <Image src="/farcaster.svg" alt="farcaster icon" height={32} width={32} className="pl-2" />
                    Farcaster
                  </Link>
                </Button>
              )} */}
              <ShareButton />
            </div>
          </div>
        </div>
      </section>

      {/* Alignment Section */}
      <section className="py-3 rounded-lg">
        <div className="container mx-auto px-2">
          <h2 className="mb-3 text-xl font-bold">Your Alignment</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Most Aligned Users */}
            <div className="bg-card p-4 rounded-lg shadow-md border-2">
              <h3 className="mb-3 text-lg font-semibold">Most Aligned</h3>
              {!userInfo && (
                <p className="text-gray-500 text-sm">Please sign in to see the most aligned users in the trust pool.</p>
              )}
              {isLoadingAlignment ? (
                <AlignmentSkeleton />
              ) : alignedUsers?.topAlignedUsers?.length > 0 ? (
                alignedUsers.topAlignedUsers.map((user: User) => (
                  <div key={user.userId} className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="">{user.farcasterUsername || user.twitterUsername}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm pr-5">|| {user.alignmentScore}%</span>
                      {user.twitterUsername && (
                        <Button size="sm" variant="outline" asChild>
                          <Link
                            href={`https://twitter.com/intent/tweet?text=Hey%20@${user.twitterUsername}%2C%20apparently%20the%20ValuesDAO%20wizards%20did%20some%20alignment%20magic%20and%20decided%20we%E2%80%99re%20a%20perfect%20match%E2%80%94for%20world%20domination%2C%20or%20at%20least%20a%20solid%20conversation.%0ACare%20to%20jump%20into%20DMs%20and%20see%20if%20these%20guys%20actually%20know%20what%20they%E2%80%99re%20talking%20about%3F%20%F0%9F%98%84`}
                            target="_blank"
                          >
                            {/* <Image src="/farcaster.svg" alt="farcaster icon" height={20} width={20} /> */}
                            <Image src="/x.svg" alt="x icon" height={16} width={16} />
                          </Link>
                        </Button>
                      )}
                      {user.farcasterUsername && (
                        <Button size="sm" className="bg-[#855DCD] text-white hover:bg-[#9770df]" asChild>
                          <Link
                            href={`https://warpcast.com/~/compose?text=Hey%20@${user.farcasterUsername}%2C%20apparently%20the%20ValuesDao%20wizards%20did%20some%20alignment%20magic%20and%20decided%20we%E2%80%99re%20a%20perfect%20match%E2%80%94for%20world%20domination%2C%20or%20at%20least%20a%20solid%20conversation.%0ACare%20to%20jump%20into%20DMs%20and%20see%20if%20these%20guys%20actually%20know%20what%20they%E2%80%99re%20talking%20about%3F%20%F0%9F%98%84`}
                            target="_blank"
                          >
                            <Image src="/farcaster.svg" alt="farcaster icon" height={16} width={16} />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  There are not enough users to show alignment, please invite your community members.
                </p>
              )}
            </div>

            {/* Most Diverse Users */}
            <div className="bg-card p-4 rounded-lg shadow-md border-2">
              <h3 className="mb-3 text-lg font-semibold">Most Diverse</h3>
              {!userInfo && (
                <p className="text-gray-500 text-sm">Please sign in to see the most diverse users in the trust pool.</p>
              )}
              {userInfo &&
                (isLoadingAlignment ? (
                  <AlignmentSkeleton />
                ) : alignedUsers?.topDiverseUsers?.length > 0 ? (
                  alignedUsers.topDiverseUsers.map((user: User) => (
                    <div key={user.userId} className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="">{user.farcasterUsername || user.twitterUsername}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm pr-5">|| {user.alignmentScore}%</span>
                        {user.twitterUsername && (
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`https://twitter.com/intent/tweet?text=Hey%20@${user.twitterUsername}%2C%20apparently%2C%20ValuesDAO%20thinks%20we%E2%80%99re%20the%20yin%20and%20yang%20of%20value-alignment.%20We%20got%20diverse%20values.%20I%20would%20like%20to%20understand%20how%20you%20think.%0AWant%20to%20DM%20and%20see%20if%20we%E2%80%99re%20more%20like%20fire%20and%20ice%2C%20or%20just%20two%20people%20who%20shouldn%E2%80%99t%20be%20left%20alone%20in%20the%20same%20room%3F%20%F0%9F%98%84`}
                              target="_blank"
                            >
                              <Image src="/x.svg" alt="x icon" height={16} width={16} />
                            </Link>
                          </Button>
                        )}
                        {user.farcasterUsername && (
                          <Button size="sm" className="bg-[#855DCD] text-white hover:bg-[#9770df]" asChild>
                            <Link
                              href={`https://warpcast.com/~/compose?text=Hey%20@${user.twitterUsername}%2C%20apparently%2C%20ValuesDAO%20thinks%20we%E2%80%99re%20the%20yin%20and%20yang%20of%20value-alignment.%20We%20got%20diverse%20values.%20I%20would%20like%20to%20understand%20how%20you%20think.%0AWant%20to%20DM%20and%20see%20if%20we%E2%80%99re%20more%20like%20fire%20and%20ice%2C%20or%20just%20two%20people%20who%20shouldn%E2%80%99t%20be%20left%20alone%20in%20the%20same%20room%3F%20%F0%9F%98%84`}
                              target="_blank"
                            >
                              <Image src="/farcaster.svg" alt="farcaster icon" height={16} width={16} />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    There are not enough users to show alignment, please invite your community members.
                  </p>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Members Section */}
      <section className="py-6">
        <div className="container mx-auto px-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Pool Creator and Members</h2>
            <div className="flex items-center gap-2 w-1/3">
              <div className="relative w-full">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 w-full text-sm h-8"
                />
              </div>
            </div>
          </div>

          {/* List View of Members */}
          <div className="rounded-lg border bg-card">
            <ul className="divide-y">{renderUserList()}</ul>
          </div>
        </div>
      </section>
    </div>
  );
}
