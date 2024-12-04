"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ConnectButton from "@/components/ConnectButton";
import { useUserContext } from "@/providers/user-context-provider";
import { API_BASE_URL } from "@/constants";

interface User {
  _id: string;
  userId: string;
  farcasterUsername?: string;
  twitterUsername?: string;
  alignmentScore?: number;
}

const fetchAlignedUsers = async ({ trustPoolId, userId }: { trustPoolId: string; userId: string }) => {
  const response = await fetch(`${API_BASE_URL}/trustpools/alignment?trustPoolId=${trustPoolId}&userId=${userId}`);
  const data = await response.json();
  return data.data || [];
};

export default function AlignmentSection({ trustPoolId }: { trustPoolId: string }) {
  const { userInfo } = useUserContext();

  const { data: alignedUsers, isLoading } = useQuery({
    queryKey: ["alignedUsers", trustPoolId, userInfo?.userId],
    queryFn: () => fetchAlignedUsers({ trustPoolId, userId: userInfo?.userId! }),
    enabled: !!userInfo?.userId,
  });

  const hasUserGeneratedValues =
    (userInfo?.generatedValues.twitter && userInfo?.generatedValues.twitter.length > 0) ||
    (userInfo?.generatedValues.warpcast && userInfo?.generatedValues.warpcast.length > 0);

  const getBadgeColor = (score: number) => {
    if (score >= 70) {
      return "bg-[#23C55E]";
    } else if (score >= 30) {
      return "bg-primary";
    } else {
      return "bg-red-500";
    }
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

  return (
    <section className="py-3 rounded-lg">
      <div className="container mx-auto px-2">
        <h2 className="mb-3 text-xl font-bold">Your Alignment</h2>
        <div className="grid gap-4">
          {/* Most Aligned Users */}
          <div className="bg-card p-4 rounded-lg shadow-md border-2">
            <h3 className="mb-3 text-lg font-semibold">Most Aligned</h3>
            {!userInfo && (
              <p className="text-gray-500 text-sm">Please sign in to see the most aligned users in the trust pool.</p>
            )}
            {userInfo && !hasUserGeneratedValues && (
              <p className="text-gray-500 text-sm">
                Please generate your values to see the most aligned users in the trust pool.
              </p>
            )}
            {userInfo &&
              hasUserGeneratedValues &&
              (isLoading ? (
                <AlignmentSkeleton />
              ) : alignedUsers?.topAlignedUsers?.length > 0 ? (
                alignedUsers.topAlignedUsers.map((user: User) => (
                  <div key={user.userId} className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="">{user.farcasterUsername || user.twitterUsername}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold pr-5">
                        <Badge className={`${getBadgeColor(user.alignmentScore!)} p-1 px-2 text-white text-sm`}>
                          || {user.alignmentScore}%
                        </Badge>
                      </span>
                      <ConnectButton user={user} type="align" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  There are not enough users to show alignment, please invite your community members.
                </p>
              ))}
          </div>

          {/* Most Diverse Users */}
          <div className="bg-card p-4 rounded-lg shadow-md border-2">
            <h3 className="mb-3 text-lg font-semibold">Most Diverse</h3>
            {!userInfo && (
              <p className="text-gray-500 text-sm">Please sign in to see the most diverse users in the trust pool.</p>
            )}
            {userInfo && !hasUserGeneratedValues && (
              <p className="text-gray-500 text-sm">
                Please generate your values to see the most aligned users in the trust pool.
              </p>
            )}
            {userInfo &&
              hasUserGeneratedValues &&
              (isLoading ? (
                <AlignmentSkeleton />
              ) : alignedUsers?.topDiverseUsers?.length > 0 ? (
                alignedUsers.topDiverseUsers.map((user: User) => (
                  <div key={user.userId} className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="">{user.farcasterUsername || user.twitterUsername}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold pr-5">
                        <Badge className={`${getBadgeColor(user.alignmentScore!)} p-1 px-2 text-white text-sm`}>
                          || {user.alignmentScore}%
                        </Badge>
                      </span>
                      <ConnectButton user={user} type="diverse" />
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
  );
}
