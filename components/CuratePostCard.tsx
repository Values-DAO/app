import { useState } from "react";
import type { SourceEnum } from "@/types";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import Image from "next/image";
import { formatISODate } from "@/lib/utils";

interface PostCardProps {
  title: string;
  description: string;
  author: string;
  date: Date;
  source: SourceEnum;
  votes: {
    count: number;
    alignedUsers: { userId: string }[];
    notAlignedUsers: { userId: string }[];
  };
  handleUpvote: () => Promise<void>; // Assume these are async now
  handleDownvote: () => Promise<void>;
  userId?: string;
}

export function CurateTabPostCard({
  title,
  description,
  author,
  date,
  source,
  votes,
  handleDownvote,
  handleUpvote,
  userId,
}: PostCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(() =>
    userId
      ? votes.alignedUsers.some((user) => user.userId === userId) ||
        votes.notAlignedUsers.some((user) => user.userId === userId)
      : false
  );

  const totalVotes = votes.alignedUsers.length + votes.notAlignedUsers.length;
  const alignedPercentage = totalVotes > 0 ? (votes.alignedUsers.length / totalVotes) * 100 : 0;

  const handleVote = async (voteAction: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await voteAction();
      setHasVoted(true); // Update state to show the voted bar
    } finally {
      setIsLoading(false);
    }
  };

  let icon = "";
  switch (source) {
    case "Twitter":
      icon = "/x.png";
      break;
    case "Youtube":
      icon = "/youtube.png";
      break;
    case "Farcaster":
      icon = "/farcaster.png";
      break;
    case "Telegram":
      icon = "/telegram.png";
      break;
    default:
      icon = "/telegram.png";
  }

  return (
    <div className="pb-4">
      <div className="bg-white p-4 rounded-xl">
        <div className="flex gap-x-3">
          <div className="flex gap-x-2">
            <div className="bg-black rounded-full h-10 w-10 flex items-center justify-center">
              <Image src={icon} alt={"source icon"} height={24} width={24} className="invert" />
            </div>
          </div>
          <div className="flex flex-col gap-y-1">
            <h2 className="font-semibold text-base">{title}</h2>
            <p className="font-semibold text-gray-400 text-sm">{description}</p>
            <div className="flex items-center justify-between font-semibold text-gray-400 text-sm mt-1">
              <span>By {author}</span>
              <span>{formatISODate(date)}</span>
            </div>
          </div>
        </div>
      </div>

      {(hasVoted || !userId) && (
        <div className="space-y-2 mt-4">
          <Progress value={alignedPercentage} className="h-2" />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Aligned: {votes.alignedUsers.length}</span>
            <span>Not Aligned: {votes.notAlignedUsers.length}</span>
          </div>
        </div>
      )}

      {userId && !hasVoted && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-full text-base font-semibold border-black border-2"
            onClick={() => handleVote(handleUpvote)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Aligned"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-full text-base font-semibold border-black border-2"
            onClick={() => handleVote(handleDownvote)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Not Aligned"}
          </Button>
        </div>
      )}
    </div>
  );
  
}
