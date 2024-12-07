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
  handleUpvote: () => void;
  handleDownvote: () => void;
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
  let icon = "";
  switch (source) {
    case "Twitter":
      icon = "/x.svg";
      break;
    case "Youtube":
      icon = "/youtube.svg";
      break;
    case "Farcaster":
      icon = "/farcaster.svg";
      break;
    case "Telegram":
      icon = "/telegram.svg";
      break;
    default:
      icon = "/twitter.svg";
  }

  const hasVoted =
    userId &&
    (votes.alignedUsers.some((user) => user.userId === userId) ||
      votes.notAlignedUsers.some((user) => user.userId === userId));

  const totalVotes = votes.alignedUsers.length + votes.notAlignedUsers.length;
  const alignedPercentage = totalVotes > 0 ? (votes.alignedUsers.length / totalVotes) * 100 : 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg space-y-4">
      <div className="space-y-3">
        <div className="flex gap-x-2 items-center">
          <Image
            src={icon}
            alt={`${source} icon`}
            height={source === "Twitter" ? 32 : 48}
            width={source === "Twitter" ? 32 : 48}
          />
          <h2 className="font-bold text-lg">{title}</h2>
        </div>
        <p className="text-sm">{description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>By {author}</span>
          <span>{formatISODate(date)}</span>
        </div>
      </div>

      {!userId && (
        <div className="space-y-2 mt-4">
          <Progress value={alignedPercentage} className="h-2" />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Aligned: {votes.alignedUsers.length}</span>
            <span>Not Aligned: {votes.notAlignedUsers.length}</span>
          </div>
        </div>
      )}

      {hasVoted && (
        <div className="space-y-2 mt-4">
          <Progress value={alignedPercentage} className="h-2" />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Aligned: {votes.alignedUsers.length}</span>
            <span>Not Aligned: {votes.notAlignedUsers.length}</span>
          </div>
        </div>
      )}
      {userId && !hasVoted && (
        <div className="grid grid-cols-2 gap-6 mt-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-full text-lg font-semibold border-black border-2"
            onClick={handleUpvote}
          >
            Aligned
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-full text-lg font-semibold border-black border-2"
            onClick={handleDownvote}
          >
            Not Aligned
          </Button>
        </div>
      )}
    </div>
  );
}
