"use client"

import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {useRouter} from "next/navigation";

// @ts-ignore will fix this later
export const TrustPoolCard = ({ pool }) => {
	const router = useRouter()

	return (
		<Card className="transition-shadow hover:shadow-lg">
				<CardHeader className="flex flex-row items-center gap-4">
					<Image
						src={pool.logo || '/valuesDAO.png'}
						alt={`${pool.name} logo`}
						width={40}
						height={40}
						className="rounded-full"
					/>
					<CardTitle>{pool.name}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">{pool.description}</p>
				</CardContent>
				<CardFooter className="flex items-center justify-between">
					<Button variant="outline" size="sm" onClick={() => {router.push(`/trustpools/${pool._id}`)}}>
						View Pool
					</Button>
				</CardFooter>
		</Card>
	)
};