"use client";

import Image from "next/image";
import { DollarSign, Play } from "lucide-react";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "@/constants";
import { useUserContext } from "@/providers/user-context-provider";
import { CultureBookSkeletonCard } from "./culture-book-skeleton-card";
import { CultureCard } from "./culture-book-card";
import type { Post } from "@/types";

interface Response {
  posts: Post[];
  trustPoolName: string;
  ticker: string;
  tokenPrice: number;
}

const fetchCultureBook = async (trustPoolId: string): Promise<Response> => {
  const response = await axios.get(`${API_BASE_URL}/cultureBook?trustPoolId=${trustPoolId}`);
  
  if (response.status !== 200) {
    throw new Error("Failed to fetch culture book data.");
  }
  
  return response.data.data;
}

export default function CultureBook() {
  const pathname = usePathname();
  const trustPoolId = pathname.split("/")[2];
  const queryClient = useQueryClient();
  const {userInfo} = useUserContext()
  const displayName = userInfo?.farcasterUsername || userInfo?.twitterUsername || userInfo?.email || "Guest";
  
  // Queries
  const {data: cultureBook, isLoading, isError} = useQuery<Response>({
    queryKey: ["cultureBook", trustPoolId],
    queryFn: () => fetchCultureBook(trustPoolId),
  })
  
  const posts: Post[] = cultureBook?.posts || [];
  
  if (isError) {
    return <div>Failed to load culture book data.</div>
  }
  
  return (
    <div className="pb-20">
      {/* <div className="px-4 flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">${cultureBook?.ticker}</h1> TOOO: Update this
        <div className="flex items-center gap-1">
          <span className="px-3 py-1 rounded-full bg-gray-100 font-bold">${cultureBook?.tokenPrice}</span>
        </div>
      </div> */}

      <div className="space-y-4">
        {isLoading && (
          <>
            <CultureBookSkeletonCard />
            <CultureBookSkeletonCard />
          </>
        )}
        {!isLoading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-2xl font-bold">No posts yet</h1>
              <p className="text-center ">
                No posts yet in this culture book. Make sure to use our Telegram Bot in your community to capture
                culture and post it here.
              </p>
            </div>
          </div>
        )}
        {/* {!isLoading && (
          <div>
            <div>
              {cultureBook?.trustPoolName && (
                <div>
                  <h1 className="text-2xl font-">{cultureBook.trustPoolName}</h1>
                </div>
              )}
            </div>
            <div>
              {posts.map((post) => (
                <CultureCard key={post._id.toString()} post={post} />
              ))}
            </div>
          </div>
        )} */}
        {!isLoading && posts.length !== 0 && (
          <div className="px-4">
            <h1 className="text-2xl font-semibold">{cultureBook?.trustPoolName || "Loading..."}</h1>
          </div>
        )}
        {!isLoading && posts.map((post) => <CultureCard key={post._id.toString()} post={post} />)}
      </div>
    </div>
  );
}
