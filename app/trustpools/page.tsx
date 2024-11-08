'use client'

import React, { useState, useRef } from 'react'
import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { TrustPoolCardSkeleton } from '@/components/TrustPoolCardSkeleton'
import { TrustPoolCard } from '@/components/TrustPoolCard'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { API_BASE_URL } from '@/constants'
import axios from "axios";
import {useRouter} from "next/navigation";
import {useUserContext} from "@/providers/user-context-provider";

interface TrustPool {
	_id: string
	name: string
	description: string
	logo: string
}

const fetchTrustPools = async (): Promise<TrustPool[]> => {
	const response = await fetch(`${API_BASE_URL}/trustpools`)
	if (!response.ok) {
		throw new Error('Failed to fetch trust pools')
	}
	const data = await response.json()
	return data.data
}

const fetchSearchResults = async (searchTerm: string): Promise<TrustPool[]> => {
	if (!searchTerm) return []
	const response = await fetch(`${API_BASE_URL}/trustpools/search?name=${encodeURIComponent(searchTerm)}`)
	if (!response.ok) {
		throw new Error('Failed to fetch search results')
	}
	const data = await response.json()
	return Array.isArray(data) ? data : []
}

// Define the form schema
const formSchema = z.object({
	name: z.string().min(1, 'Please provide a name').max(32, 'Name is too long'),
	description: z.string().min(1, 'Please provide a description').max(500, 'Description is too long'),
	telegramLink: z.string().url('Invalid URL'),
	twitterHandle: z.string().url('Invalid URL'),
	organizerTwitterHandle: z.string().url('Invalid URL'),
})

export default function Home() {
	const [searchTerm, setSearchTerm] = useState('')
	const [filteredTrustPools, setFilteredTrustPools] = useState<TrustPool[]>([])
	const [isFormVisible, setIsFormVisible] = useState(false)
	const debounceTimer = useRef<NodeJS.Timeout | null>(null)
	const router = useRouter()
	const {userInfo} = useUserContext()

	// Query for initial trust pools
	const {
		data: trustPools = [],
		isLoading: isInitialLoading,
		error: initialError
	} = useQuery({
		queryKey: ['trustPools'],
		queryFn: fetchTrustPools,
	})

	// Update filteredTrustPools based on search input or reset when empty
	const handleSearchInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setSearchTerm(value)

		if (!value) {
			setFilteredTrustPools(trustPools)
			return
		}

		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current)
		}

		debounceTimer.current = setTimeout(async () => {
			try {
				const results = await fetchSearchResults(value)
				setFilteredTrustPools(results)
			} catch (error) {
				console.error("Error fetching search results:", error)
			}
		}, 150)
	}

	// Determine what to display based on the state
	const isLoading = isInitialLoading
	const error = initialError
	const displayPools = searchTerm ? filteredTrustPools : trustPools

	// Form handling
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			description: '',
			telegramLink: '',
			twitterHandle: '',
			organizerTwitterHandle: '',
		},
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		// Handle form submission
		const { name, description, telegramLink, twitterHandle, organizerTwitterHandle } = values
		const response = await axios.post(`${API_BASE_URL}/trustpools/new`, {
			name,
			description,
			telegramLink,
			twitterHandle,
			organizerTwitterHandle,
			userId: userInfo?.userId
		})

		if ("error" in response) {
			console.error("Error creating trust pool:", response.error)
			return
		}

		router.push(`/trustpools/${response.data.data._id}`)
	}

	return (
		<main className="min-h-screen bg-background container">
			{/* Hero Section */}
			<section className="bg-primary py-16 text-primary-foreground rounded-2xl">
				<div className="container mx-auto px-8">
					<h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
						Trust Pools
					</h1>
					<p className="text-xl sm:text-xl md:text-2xl">
						Join a Trust Pool: Connect with People Who Truly Align with Your Values
					</p>
				</div>
			</section>

			{/* Search and Trust Pool Cards Section */}
			<section className="container mx-auto px-4 py-12">
				<div className="mb-8 flex items-center">
					<div className="relative flex-1">
						<Input
							type="search"
							placeholder="Search trust pools..."
							className="pl-10 pr-4"
							onChange={handleSearchInput}
						/>
						<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
					</div>
				</div>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{isLoading ? (
						<>
							<TrustPoolCardSkeleton />
							<TrustPoolCardSkeleton />
							<TrustPoolCardSkeleton />
						</>
					) : error ? (
						<div className="col-span-3 text-center text-red-500">
							Failed to load trust pools
						</div>
					) : displayPools.length === 0 ? (
						<div className="col-span-3 text-center text-muted-foreground">
							No trust pools found
						</div>
					) : (
						displayPools.map((pool) => (
							<TrustPoolCard key={pool._id || pool.name} pool={pool} />
						))
					)}
				</div>
			</section>

			{/* Create Trust Pool Section */}
			<section className="bg-secondary py-20 rounded-2xl">
				<div className="container mx-auto px-4 text-center">
					<h2 className="mb-4 text-3xl font-bold sm:text-4xl">
						Create a Trust Pool
					</h2>
					<p className="mb-8 text-xl text-muted-foreground">
						Gather a Community of People Aligned with Your Core Values
					</p>
					<Button size="lg" onClick={() => setIsFormVisible(!isFormVisible)}>
						{isFormVisible ? 'Cancel' : 'Create New Trust Pool'}
					</Button>
				</div>
			</section>

			{/* Create Trust Pool Form */}
			<section
				className={`py-4 transition-all duration-300 ease-in-out ${
					isFormVisible ? 'border rounded-2xl shadow-xl my-10 max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
				}`}
			>
				<div className="container mx-auto px-4">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
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
											<Textarea
												placeholder="Describe your Trust Pool"
												className="resize-none"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="telegramLink"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Telegram Link</FormLabel>
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
							<Button type="submit">Submit</Button>
						</form>
					</Form>
				</div>
			</section>
		</main>
	)
}