"use client";

import { API_BASE_URL } from "@/constants";
import { useUserContext } from "@/providers/user-context-provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CurateTabPostCard} from "./CuratePostCard";
import type { Post } from "@/types";
import axios from "axios";
import { CurateTabPostCardSkeleton } from "./CuratePostCardSkeleton";

const fetchEligiblePosts = async (trustPoolId: string) => {
  const response = await fetch(`${API_BASE_URL}/cultureBook/pre-onchain/get?trustPoolId=${trustPoolId}`);
  const data = await response.json();
  return data.data.posts || [];
};

export default function CurateTab({ trustPoolId }: { trustPoolId: string }) {
  const { userInfo } = useUserContext();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["eligiblePosts", trustPoolId, userInfo?.userId],
    queryFn: () => fetchEligiblePosts(trustPoolId),
  });

  const handleVote = async (postId: string, vote: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cultureBook/pre-onchain/vote`, {
        userId: userInfo?.userId,
        trustPoolId,
        postId,
        vote,
      });

      if (response.data.status === 200) {
        // Invalidate the query to refetch posts with updated votes
        await queryClient.invalidateQueries({
          queryKey: ["eligiblePosts", trustPoolId, userInfo?.userId],
        });
      } else {
        console.error("Failed to vote: ", response.data.message);
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        {!userInfo && !isLoading ? (
          <p>Please sign in to vote!</p>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            Based on community values, mark these posts as aligned or not aligned and earn some rewards!
          </p>
        )}
      </div>

      {isLoading && (
        <>
          <CurateTabPostCardSkeleton />
          <CurateTabPostCardSkeleton />
          <CurateTabPostCardSkeleton />
        </>
      )}

      {!isLoading && posts.length === 0 && <p className="text-sm text-gray-500">No posts available for curation.</p>}

      {!isLoading &&
        posts.map((post: Post) => (
          <CurateTabPostCard
            key={post._id.toString()}
            title={post.title}
            description={post.content}
            author={post.posterUsername}
            date={post.timestamp}
            source={post.source}
            votes={post.votes}
            userId={userInfo?.userId}
            handleUpvote={() => handleVote(post._id.toString(), "1")}
            handleDownvote={() => handleVote(post._id.toString(), "-1")}
          />
        ))}
    </div>
  );
}
