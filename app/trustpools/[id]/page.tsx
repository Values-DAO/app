'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Twitter } from 'lucide-react'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {useUserContext} from "@/providers/user-context-provider";
import {API_BASE_URL} from "@/constants";
import axios from "axios";
import type { UseReadContractReturnType } from 'wagmi'

// Type definitions

interface User {
  _id: string
  userId: string
  farcasterUsername?: string
  twitterUsername?: string
	alignmentScore?: number
}

interface TrustPool {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  owners?: User[];
  members?: User[];
  telegramLink?: string;
  twitterHandle?: string;
  organizerTwitterHandle?: string;
}

interface AlignmentData {
  topAlignedUsers: User[]
  topDiverseUsers: User[]
}

// Fetch functions
const fetchTrustPool = async (trustPoolId: string): Promise<TrustPool> => {
  const response = await fetch(`${API_BASE_URL}/trustpools/find?trustPoolId=${trustPoolId}`);
  const data = await response.json();
  return data.data || [];
};

const fetchAlignedUsers = async ({
  trustPoolId,
  userId,
}: {
  trustPoolId: string;
  userId: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/trustpools/alignment?trustPoolId=${trustPoolId}&userId=${userId}`);
  const data = await response.json();
  return data.data || [];
};

const fetchSearchResults = async ({ trustPoolId, username }: {trustPoolId: string, username: string}): Promise<User[]> => {
	if (!username) return []
	const response = await fetch(`${API_BASE_URL}/trustpools/userSearch?trustPoolId=${trustPoolId}&username=${username}`)
	const data = await response.json()
	return data.data || []
}

const useDebounce = (value: string, delay: number) => {
	const [debouncedValue, setDebouncedValue] = useState(value)

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay)
		return () => clearTimeout(timer)
	}, [value, delay])

	return debouncedValue
}

export default function Dashboard({ params }: {params: {id: string}}) {
	const trustPoolId = params.id!
	const router = useRouter()
	const { userInfo } = useUserContext()
	const queryClient = useQueryClient()
	const [searchTerm, setSearchTerm] = useState('')
	const debouncedSearch = useDebounce(searchTerm, 150)
	const [buttonText, setButtonText] = useState<string>("")

	// Fetch trust pool details
	const { data: trustPool, isLoading: isLoadingPool } = useQuery({
		queryKey: ['trustPool', trustPoolId],
		queryFn: () => fetchTrustPool(trustPoolId),
	})

	// Fetch aligned users
	const { data: alignedUsers, isLoading: isLoadingAlignment } = useQuery({
		queryKey: ['alignedUsers', trustPoolId, userInfo?.userId],
		queryFn: () => fetchAlignedUsers({ trustPoolId, userId: userInfo?.userId! }),
		enabled: !!userInfo?.userId 
	})

	// Fetch search results
	const { data: searchResults } = useQuery({
		queryKey: ['searchResults', trustPoolId, debouncedSearch],
		queryFn: () => fetchSearchResults({ trustPoolId, username: debouncedSearch }),
		enabled: !!debouncedSearch 
	})

	const updateButtonText = useCallback(() => {
		if (!trustPool || !userInfo) return
		const isOwner = trustPool.owners?.some(owner => owner.userId === userInfo.userId)
		const isMember = trustPool.members?.some(member => member.userId === userInfo.userId)
		setButtonText(isOwner ? "Edit" : isMember ? "Leave" : "Join")
	}, [trustPool, userInfo])

	useEffect(() => {
		updateButtonText()
	}, [updateButtonText])

	const handleJoinButton = async () => {
		const isOwner = trustPool?.owners?.some((owner) => owner.userId === userInfo?.userId);
		const isMember = trustPool?.members?.some((member) => member.userId === userInfo?.userId);

		if (isOwner) {
			setButtonText('Edit');
			router.push(`/trustpools/${trustPoolId}/edit`);
		} else if (isMember) {
			// Handle leave functionality
			await axios.put(`${API_BASE_URL}/trustpools/join`, {
				userId: userInfo?.userId,
				trustPoolId,
				action: 'leave',
			});
			setButtonText('Join');
		} else {
			// Handle join functionality
			await axios.put(`${API_BASE_URL}/trustpools/join`, {
				userId: userInfo?.userId,
				trustPoolId,
				action: 'join',
			});
			setButtonText('Leave');
		}

		// Invalidate trustPool data to refetch and get the latest membership status
		// @ts-ignore
		queryClient.invalidateQueries(["trustPool", trustPoolId]);
	};

	const renderUserList = () => {
		if (searchTerm) {
			return searchResults?.map((user) => (
				<li key={user._id} className="flex items-center justify-between p-4 border-b">
					<div className="flex items-center gap-2">
						<span>{user.farcasterUsername || user.twitterUsername}</span>
						<Badge variant="outline">
							{trustPool?.owners?.some(owner => owner.userId === user.userId) ? 'Owner' : 'Member'}
						</Badge>
					</div>
					<div className="flex items-center gap-2">
						{user.twitterUsername && (
							<Button size="icon" variant="outline" asChild>
								<Link href={`https://twitter.com/${user.twitterUsername}`} target="_blank">
									<Twitter className="h-4 w-4" />
								</Link>
							</Button>
						)}
						{user.farcasterUsername && (
							<Button size="icon" className="bg-[#9c6bff] text-white hover:bg-[#7c4dff]" asChild>
								<Link href={`https://warpcast.com/${user.farcasterUsername}`} target="_blank">
									<svg viewBox="0 0 32 32" className="h-4 w-4 fill-current">
										<path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm8.5 18.5H22v3a1 1 0 01-1 1h-2.5v-4h-5v4H11a1 1 0 01-1-1v-3H7.5v-3h3V11a1 1 0 011-1h9a1 1 0 011 1v4.5h3v3z" />
									</svg>
								</Link>
							</Button>
						)}
					</div>
				</li>
			))
		}

		return trustPool?.owners?.map((owner) => (
			<li key={owner._id} className="flex items-center justify-between p-4 border-b">
				<div className="flex items-center gap-2">
					<span>{owner.farcasterUsername || owner.twitterUsername}</span>
					<Badge>Owner</Badge>
				</div>
				<div className="flex items-center gap-2">
					{owner.twitterUsername && (
						<Button size="icon" variant="outline" asChild>
							<Link href={`https://twitter.com/${owner.twitterUsername}`} target="_blank">
								<Twitter className="h-4 w-4" />
							</Link>
						</Button>
					)}
					{owner.farcasterUsername && (
						<Button size="icon" className="bg-[#9c6bff] text-white hover:bg-[#7c4dff]" asChild>
							<Link href={`https://warpcast.com/${owner.farcasterUsername}`} target="_blank">
								<svg viewBox="0 0 32 32" className="h-4 w-4 fill-current">
									<path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm8.5 18.5H22v3a1 1 0 01-1 1h-2.5v-4h-5v4H11a1 1 0 01-1-1v-3H7.5v-3h3V11a1 1 0 011-1h9a1 1 0 011 1v4.5h3v3z" />
								</svg>
							</Link>
						</Button>
					)}
				</div>
			</li>
		))
	}

	const AlignmentSkeleton = () => (
		<div className="space-y-4">
			{[1, 2, 3].map((i) => (
				<div key={i} className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Skeleton className="h-10 w-10 rounded-full" />
						<Skeleton className="h-4 w-32" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-8 w-8" />
						<Skeleton className="h-8 w-8" />
					</div>
				</div>
			))}
		</div>
	)

	if (isLoadingPool) {
		return (
			<div className="flex flex-col gap-2 items-center justify-center h-screen">
			<div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
			<h4 className="scroll-m-20 text-lg font-light tracking-tight">
				Loading...
			</h4>
		</div>
		)
	}

	return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary py-6 sm:py-10 text-primary-foreground rounded-2xl mb-4 mx-4">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:items-start">
            <Image
              src={trustPool?.logo || "/valuesDAO.png"}
              alt={`${trustPool?.name || "Trust Pool"} logo`}
              width={100}
              height={100}
              className="rounded-full w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0"
            />
            <div className="flex-1 text-center md:text-left overflow-hidden">
              <h1 className="mb-2 text-2xl sm:text-3xl font-bold md:text-4xl truncate">
                {trustPool?.name || "Trust Pool Name"}
              </h1>
              <p className="mb-4 text-sm sm:text-base md:text-lg break-words">
                {trustPool?.description ||
                  "Trust Pool description goes here. This is a placeholder text that will be replaced with the actual description of the trust pool. It can be a longer text that wraps to multiple lines as needed, providing more information about the trust pool and its purpose."}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex-shrink-0">
              <Button variant="secondary" onClick={handleJoinButton}>
                {buttonText || "Join Pool"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Alignment Section */}
      {/* Alignment Section */}
      <section className="py-4 rounded-2xl">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-2xl font-bold">Community Alignment</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Most Aligned Users */}
            <div className="bg-card p-6 border-2 rounded-2xl shadow-xl">
              <h3 className="mb-4 text-xl font-semibold">Most Aligned</h3>
              {isLoadingAlignment ? (
                <AlignmentSkeleton />
              ) : alignedUsers?.topAlignedUsers?.length > 0 ? (
                alignedUsers.topAlignedUsers.map((user: User) => (
                  <div key={user.userId} className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{user.farcasterUsername || user.twitterUsername}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">|| {user.alignmentScore}%</span>
                      {user.twitterUsername && (
                        <Button size="icon" variant="outline" asChild>
                          <Link href={`https://twitter.com/${user.twitterUsername}`} target="_blank">
                            <Twitter className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {user.farcasterUsername && (
                        <Button size="icon" className="bg-[#9c6bff] text-white hover:bg-[#7c4dff]" asChild>
                          <Link href={`https://warpcast.com/${user.farcasterUsername}`} target="_blank">
                            <svg viewBox="0 0 32 32" className="h-4 w-4 fill-current">
                              <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm8.5 18.5H22v3a1 1 0 01-1 1h-2.5v-4h-5v4H11a1 1 0 01-1-1v-3H7.5v-3h3V11a1 1 0 011-1h9a1 1 0 011 1v4.5h3v3z" />
                            </svg>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>There are not enough users to show alignment, please invite your community members.</p>
              )}
            </div>

            {/* Most Diverse Users */}
            <div className="bg-card p-6 border-2 rounded-2xl shadow-xl">
              <h3 className="mb-4 text-xl font-semibold">Most Diverse</h3>
              {isLoadingAlignment ? (
                <AlignmentSkeleton />
              ) : alignedUsers?.topDiverseUsers?.length > 0 ? (
                alignedUsers.topDiverseUsers.map((user: User) => (
                  <div key={user.userId} className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{user.farcasterUsername || user.twitterUsername}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">|| {user.alignmentScore}%</span>
                      {user.twitterUsername && (
                        <Button size="icon" variant="outline" asChild>
                          <Link href={`https://twitter.com/${user.twitterUsername}`} target="_blank">
                            <Twitter className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {user.farcasterUsername && (
                        <Button size="icon" className="bg-[#9c6bff] text-white hover:bg-[#7c4dff]" asChild>
                          <Link href={`https://warpcast.com/${user.farcasterUsername}`} target="_blank">
                            <svg viewBox="0 0 32 32" className="h-4 w-4 fill-current">
                              <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm8.5 18.5H22v3a1 1 0 01-1 1h-2.5v-4h-5v4H11a1 1 0 01-1-1v-3H7.5v-3h3V11a1 1 0 011-1h9a1 1 0 011 1v4.5h3v3z" />
                            </svg>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>There are not enough users to show alignment, please invite your community members.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Members Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Pool Owners and Members</h2>
            <div className="flex items-center gap-4 w-1/3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
          </div>

          {/* List View of Members */}
          <div className="rounded-lg border bg-card">
            <ul className="divide-y">{renderUserList()}</ul>
          </div>
        </div>
      </section>
    </div>
  );
}