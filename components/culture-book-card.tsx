"use client"

import Image from "next/image";
import { Play } from "lucide-react";
import type { Post } from "@/types";
import { formatISODate } from "@/lib/utils";
import ValueBadge from "./ui/value-badge";
import ImageModal from "./ImageModal";
import { useState } from "react";
import Link from "next/link";

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
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  return (
    <>
      <div className="bg-white p-4 mx-4 rounded-xl">
        <div className="flex gap-x-3">
          <div className="flex-shrink-0">
            <div className="bg-[#FACC14] rounded-full h-10 w-10 flex items-center justify-center">
              <Image src={icon} alt="source icon" height={24} width={24} />
            </div>
          </div>
          <div className="flex flex-col gap-y-1 min-w-0 w-full">
            <Link href={`https://basescan.org/tx/${post.transactionHash}`}>
              <h2 className="font-semibold text-base truncate underline cursor-pointer">{post.title}</h2>
            </Link>
            <p className="font-semibold text-gray-400 text-sm break-words hyphens-auto overflow-wrap-break-word whitespace-pre-wrap">
              {post.content}
            </p>
            {post.hasPhoto && (
              <div
                className="relative w-full h-64 md:h-72 overflow-hidden rounded-[18px] cursor-pointer"
                onClick={() => setIsImageModalOpen(true)}
              >
                <Image
                  src={post.photoUrl!}
                  layout="fill"
                  objectFit="cover"
                  alt="photo"
                  className="object-cover transition-transform hover:scale-105 duration-200"
                />
              </div>
            )}
            <div className="flex items-center justify-between font-semibold text-gray-400 text-sm mt-1">
              <span className="truncate">{`By ${post.posterUsername}`}</span>
              <span className="flex-shrink-0 ml-2">{formatISODate(post.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>

      <ImageModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} imageUrl={post.photoUrl!} />
    </>
  );
}
