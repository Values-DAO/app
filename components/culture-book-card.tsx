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
      icon = "/x.png";
      break;
    case "Youtube":
      icon = "/youtube.png";
      break;
    // case "Instagram":
    //   icon = "instagram.svg";
    //   break;
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
    <div className="bg-white p-4 mx-4 rounded-xl">
      <div className="flex gap-x-3">
        <div className="flex gap-x-2">
          <div className="bg-[#FACC14] rounded-full h-10 w-10 flex items-center justify-center">
            <Image src={icon} alt={"source icon"} height={24} width={24} />
          </div>
        </div>
        <div className="flex flex-col gap-y-1 w-full">
          <h2 className="font-semibold text-base">{post.title}</h2>
          <p className="font-semibold text-gray-400 text-sm">{post.content}</p>
          <div className="flex items-center justify-between font-semibold text-gray-400 text-sm mt-1">
            <span>By {post.posterUsername}</span>
            <span>{formatISODate(post.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
