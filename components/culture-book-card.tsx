import Image from "next/image";
import { Play } from "lucide-react";
import type { Post } from "@/types";
import { formatISODate } from "@/lib/utils";
import ValueBadge from "./ui/value-badge";

export function CultureCard({ post }: { post: Post }) {
  // select icon according to source
  // icons are in public folder with name as "instagram.svg", "twitter.svg", "youtube.svg"
  let icon = "";
  switch (post.source) {
    case "Twitter":
      icon = "/twitter.svg";
      break;
    case "Youtube":
      icon = "/youtube.svg";
      break;
    // case "Instagram":
    //   icon = "instagram.svg";
    //   break;
    case "Farcaster":
      icon = "/farcaster.svg";
      break;
    case "Telegram":
      icon = "/telegram.svg";
      break;
    default:
      icon = "/twitter.svg";
  }
  
  return (
    <div className="bg-white p-4 mx-4 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <div>
          <div className="flex gap-x-2 items-center mb-2">
            <Image src={icon} alt={"source icon"} height={48} width={48} />
            <h2 className="font-bold text-lg">{post.title}</h2>
          </div>
          <p className="text-sm">{post.content}</p>
        </div>
      </div>
      <div className="flex items-center my-2 text-sm">
        {post.values.slice(0, 3).map((value) => (
          <div className="pr-2">
            <ValueBadge key={value} value={value} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>By {post.posterUsername}</span>
        <span>{formatISODate(post.timestamp)}</span>
      </div>
    </div>
  );
}
