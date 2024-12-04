"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/constants";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/providers/user-context-provider";
import { useDebounce } from "@/hooks/useDebounce";

interface User {
  _id: string;
  userId: string;
  farcasterUsername?: string;
  twitterUsername?: string;
  email?: string;
}

interface TrustPool {
  _id: string;
  name: string;
  owners?: User[];
  members?: User[];
}

const fetchTrustPool = async (trustPoolId: string): Promise<TrustPool> => {
  const response = await fetch(`${API_BASE_URL}/trustpools/find?trustPoolId=${trustPoolId}`);
  const data = await response.json();
  return data.data || {};
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

export default function MembersSection({ trustPoolId }: { trustPoolId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const router = useRouter();
  const { userInfo } = useUserContext();

  const { data: trustPool, isLoading: isLoadingPool } = useQuery({
    queryKey: ["trustPool", trustPoolId],
    queryFn: () => fetchTrustPool(trustPoolId),
  });

  const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
    queryKey: ["searchResults", trustPoolId, debouncedSearch],
    queryFn: () => fetchSearchResults({ trustPoolId, username: debouncedSearch }),
    enabled: !!debouncedSearch,
  });

  const handleAlignmentPage = (username: string) => {
    if (!userInfo) return;
    if (username.length === 0) return;
    router.push(`/user-alignment?=${userInfo?.twitterUsername || userInfo?.farcasterUsername}&target=${username}`);
  };

  const renderUserList = () => {
    if (isLoadingPool || isLoadingSearch) {
      return <li>Loading...</li>;
    }

    if (debouncedSearch) {
      return searchResults?.map((user) => (
        <li
          key={user._id}
          className="flex items-center justify-between p-2 border-b cursor-pointer min-h-[56px]"
          onClick={() => handleAlignmentPage(user.farcasterUsername || user.twitterUsername || "")}
        >
          <div className="flex items-center gap-2">
            <span className="text pl-2">{user.farcasterUsername || user.twitterUsername || user.email}</span>
            <Badge variant="outline" className="text-xs">
              {trustPool?.owners?.some((owner) => owner.userId === user.userId) ? "Creator" : "Member"}
            </Badge>
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
    }

    const combinedUsers = [...(trustPool?.owners || []), ...(trustPool?.members || [])].slice(0, 10);

    return combinedUsers.map((user, index) => (
      <li
        key={user._id || index}
        className="flex items-center justify-between p-2 border-b cursor-pointer min-h-[56px]"
        onClick={() => handleAlignmentPage(user.farcasterUsername || user.twitterUsername || "")}
      >
        <div className="flex items-center gap-2 pl-2">
          <span className="text-sm">{user.farcasterUsername || user.twitterUsername || user.email}</span>
          {index === 0 && <Badge className="text-xs">Creator</Badge>}
        </div>
        <div className="flex items-center gap-2">
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

  return (
    <section className="py-6">
      <div className="container mx-auto px-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pool Creator and Members</h2>
          <div className="flex items-center gap-2 w-full">
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
  );
}
