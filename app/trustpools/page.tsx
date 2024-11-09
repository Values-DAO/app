"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Plus, X, Twitter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TrustPoolCardSkeleton } from "@/components/TrustPoolCardSkeleton";
import { TrustPoolCard } from "@/components/TrustPoolCard";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { API_BASE_URL } from "@/constants";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/providers/user-context-provider";
import { formSchema } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface TrustPool {
  _id: string;
  name: string;
  description: string;
  twitterHandle: string;
  farcasterHandle: string;
  communityLink: string;
  logo: string;
}

const fetchTrustPools = async (): Promise<TrustPool[]> => {
  const response = await fetch(`${API_BASE_URL}/trustpools`);
  if (!response.ok) {
    throw new Error("Failed to fetch trust pools");
  }
  const data = await response.json();
  return data.data;
};

const fetchSearchResults = async (searchTerm: string): Promise<TrustPool[]> => {
  if (!searchTerm) return [];
  const response = await fetch(`${API_BASE_URL}/trustpools/search?name=${encodeURIComponent(searchTerm)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTrustPools, setFilteredTrustPools] = useState<TrustPool[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { userInfo } = useUserContext();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    data: trustPools = [],
    isLoading: isInitialLoading,
    error: initialError,
  } = useQuery({
    queryKey: ["trustPools"],
    queryFn: fetchTrustPools,
  });

  const handleSearchInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value) {
      setFilteredTrustPools(trustPools);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await fetchSearchResults(value);
        setFilteredTrustPools(results);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    }, 150);
  };

  const isLoading = isInitialLoading;
  const error = initialError;
  const displayPools = searchTerm ? filteredTrustPools : trustPools;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      communityLink: "",
      twitterHandle: "",
      farcasterHandle: "",
      organizerTwitterHandle: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { name, description, communityLink, twitterHandle, organizerTwitterHandle, farcasterHandle } = values;
    const response = await axios.post(`${API_BASE_URL}/trustpools/new`, {
      name,
      description,
      communityLink,
      twitterHandle,
      farcasterHandle,
      organizerTwitterHandle,
      userId: userInfo?.userId,
    });

    if ("error" in response) {
      console.error("Error creating trust pool:", response.error);
      return;
    }

    router.push(`/trustpools/${response.data.data._id}`);
  }
  
  const handleRedirect = (id: string) => {
    router.push(`/trustpools/${id}`);
  }

  return (
    <main className="min-h-screen bg-background md:container px-2">
      {/* Hero Section */}
      <section className="bg-primary py-8 md:py-12 text-primary-foreground rounded-lg mb-4 sm:px-2">
        <div className="container mx-auto px-4">
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">Trust Pools</h1>
          <p className="text-md sm:text-lg">
            Discover TrustPools, where crypto communities align their values and collaborate to build a decentralized
            future. Join us in fostering trust and innovation in the blockchain space.
          </p>
        </div>
      </section>

      {/* Search and Create Button Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Input
              type="search"
              placeholder="Search trust pools..."
              className="pl-8 pr-4"
              onChange={handleSearchInput}
            />
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          </div>
          <div className="hidden md:block">
            <Button
              variant="default"
              onClick={() => setIsFormVisible(!isFormVisible)}
              aria-label={isFormVisible ? "Close form" : "Open create trust pool form"}
            >
              {isFormVisible ? "Close Form" : "Create Trust Pool"}
            </Button>
          </div>
          <div className="block md:hidden">
            <Button
              size="icon"
              variant="default"
              onClick={() => setIsFormVisible(!isFormVisible)}
              aria-label={isFormVisible ? "Close form" : "Open create trust pool form"}
            >
              {isFormVisible ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      
        {/* Create Trust Pool Form */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isFormVisible ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-card p-4 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Create Trust Pool</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of your Community</FormLabel>
                      <FormControl>
                        <Input placeholder="Trust Pool Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your Trust Pool" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="communityLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://t.me/yourgroup" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="twitterHandle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter Handle</FormLabel>
                      <FormControl>
                        <Input placeholder="https://x.com/yourtwitter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="farcasterHandle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farcaster Handle</FormLabel>
                      <FormControl>
                        <Input placeholder="https://warpcast.com/yourfarcaster" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organizerTwitterHandle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organizer Twitter Handle</FormLabel>
                      <FormControl>
                        <Input placeholder="https://x.com/organizertwitter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsFormVisible(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Trust Pool</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>

      {/* Trust Pool Cards/List Section */}
      <section className="mx-auto px-4 pb-12">
        {isMobile ? (
          <ul className="space-y-4">
            {isLoading ? (
              <>
                <TrustPoolCardSkeleton />
                <TrustPoolCardSkeleton />
                <TrustPoolCardSkeleton />
              </>
            ) : error ? (
              <li className="text-center text-red-500">Failed to load trust pools</li>
            ) : displayPools.length === 0 ? (
              <li className="text-center text-muted-foreground">No trust pools found</li>
            ) : (
              displayPools.map((pool) => (
                <li
                  key={pool._id || pool.name}
                  className="bg-card p-4 rounded-lg shadow-md flex items-center gap-4 border border-gray-200 cursor-pointer"
                  onClick={() => handleRedirect(pool._id)}
                >
                  <img src={pool.logo || "/valuesDAO.png"} alt={pool.name} className="w-12 h-12 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{pool.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{pool.description}</p>
                  </div>
                  <div className="flex gap-6">
                    <Link
                      href={pool.twitterHandle || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Image
                        src="/x.svg"
                        alt="x icon"
                        height={24}
                        width={24}
                      />
                    </Link>
                    <Link
                      href={pool.farcasterHandle || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Image
                        src="/farcaster.svg"
                        alt="farcaster icon"
                        height={24}
                        width={24}
                      />
                    </Link>
                    <Link
                      href={pool.communityLink || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                        />
                      </svg>
                    </Link>
                  </div>
                </li>
              ))
            )}
          </ul>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                <TrustPoolCardSkeleton />
                <TrustPoolCardSkeleton />
                <TrustPoolCardSkeleton />
              </>
            ) : error ? (
              <div className="col-span-full text-center text-red-500">Failed to load trust pools</div>
            ) : displayPools.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground">No trust pools found</div>
            ) : (
              displayPools.map((pool) => <TrustPoolCard key={pool._id || pool.name} pool={pool} />)
            )}
          </div>
        )}
      </section>
    </main>
  );
}
