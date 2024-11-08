'use client'

import {useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { API_BASE_URL } from '@/constants'
import axios from "axios";
import {useUserContext} from "@/providers/user-context-provider";

const formSchema = z.object({
  name: z.string().min(1, "Please provide a name").max(32, "Name is too long"),
  description: z.string().min(1, "Please provide a description").max(500, "Description is too long"),
  telegramLink: z.string().url("Invalid URL"),
  twitterHandle: z.string().url("Invalid URL"),
  organizerTwitterHandle: z.string().url("Invalid URL"),
});

type TrustPool = z.infer<typeof formSchema>

export default function EditTrustPool({ params }: { params: {id: string}}) {
	const trustPoolId = params.id!

	const router = useRouter()
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const {userInfo} = useUserContext()

	const form = useForm<TrustPool>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			description: '',
			telegramLink: '',
			twitterHandle: '',
			organizerTwitterHandle: '',
		},
	})

	// Fetch trust pool data
	useEffect(() => {
		const fetchTrustPool = async () => {
			if (!trustPoolId) return;

			setIsLoading(true)
			try {
				const response = await fetch(`${API_BASE_URL}/trustpools/find?trustPoolId=${trustPoolId}`)
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}
				const result = await response.json()

				if (!result.data) {
					throw new Error('No data received from the server')
				}

				// Reset the form with all values at once
				form.reset({
					name: result.data.name,
					description: result.data.description,
					telegramLink: result.data.telegramLink,
					twitterHandle: result.data.twitterHandle,
					organizerTwitterHandle: result.data.organizerTwitterHandle,
				})
			} catch (error) {
				console.error('Fetch error:', error)
				setError(error instanceof Error ? error.message : 'Failed to load trust pool data')
			} finally {
				setIsLoading(false)
			}
		}

		fetchTrustPool()
	}, [trustPoolId, form])

	const onSubmit = async (values: TrustPool) => {
		setIsLoading(true)
		setError(null)
		try {
			const response = await axios.put(`${API_BASE_URL}/trustpools/edit`, {
				valuesToChange: {
					name: values.name,
					description: values.description,
					telegramLink: values.telegramLink,
					twitterHandle: values.twitterHandle,
					organizerTwitterHandle: values.organizerTwitterHandle,
				},
				userId: userInfo?.userId,
				trustPoolId: trustPoolId
			})

			if (response.data.error) {
				throw new Error(response.data.error)
			}

			router.push(`/trustpools/${trustPoolId}`)
		} catch (error) {
			console.error('Update error:', error)
			setError(error instanceof Error ? error.message : 'Failed to update trust pool')
		} finally {
			setIsLoading(false)
		}
	}

	const handleDelete = async () => {
		setIsLoading(true)
		setError(null)
		try {
			const response = await axios.delete(`${API_BASE_URL}/trustpools/delete?trustPoolId=${trustPoolId}&userId=${userInfo?.userId}`)

			if (response.data.error) {
				throw new Error(response.data.error)
			}

			router.push('/trustpools')
		} catch (error) {
			console.error('Delete error:', error)
			setError(error instanceof Error ? error.message : 'Failed to delete trust pool')
		} finally {
			setIsLoading(false)
		}
	}

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2 items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary"></div>
				<h4 className="scroll-m-20 text-lg font-light tracking-tight">
					Loading...
				</h4>
			</div>
		)
	}

	if (!trustPoolId) {
		return <div className="text-center text-red-500">Trust Pool ID not found</div>
	}

	if (error) {
		return (
			<div className="container py-8">
				<div className="text-center text-red-500 mb-4">{error}</div>
				<div className="text-center">
					<Button onClick={() => setError(null)}>Try Again</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="container py-8">
			<h1 className="mb-6 text-3xl font-bold">Edit Trust Pool</h1>
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
					<div className="flex justify-between">
						<Button type="submit" disabled={isLoading}>
							{isLoading ? 'Updating...' : 'Update Trust Pool'}
						</Button>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">Delete Trust Pool</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete your
										trust pool and remove all data associated with it.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
										{isLoading ? 'Deleting...' : 'Delete'}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</form>
			</Form>
		</div>
	)
}