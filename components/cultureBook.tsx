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
import Link from "next/link";

interface Response {
  posts: Post[];
  trustPoolName: string;
  telegramChannel: string;
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
 
  // Queries
  const {data: cultureBook, isLoading, isError} = useQuery<Response>({
    queryKey: ["cultureBook", trustPoolId],
    queryFn: () => fetchCultureBook(trustPoolId),
  })
  
  const posts: Post[] = cultureBook?.posts || [];
  
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">ERROR 404: Trust Pool not found!</h1>
          <p className="text-center ">
            It looks like either you've hit the wrong route or there's an issue with the trust pool you're looking for. Please check the URL or try again later.
          </p>
        </div>
      </div>
    );
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
          <div className="flex flex-col items-center justify-center h-full p-4">
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
          <div className="px-4 gap-x-3 flex items-center ">
            <h1 className="text-2xl font-semibold">{cultureBook?.trustPoolName || "Loading..."}</h1>
            <a href={cultureBook?.telegramChannel}>
              <Image src="/telegram.png" alt="Telegram" height={30} width={30} />
            </a>
          </div>
        )}
        {!isLoading && posts.map((post) => <CultureCard key={post._id.toString()} post={post} />)}
      </div>
    </div>
  );
}
