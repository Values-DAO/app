import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export const TrustPoolCardSkeleton = () => (
	<Card className="w-full">
		<CardHeader className="flex flex-row items-center gap-4">
			<Skeleton className="h-10 w-10 rounded-full" />
			<Skeleton className="h-6 w-32" />
		</CardHeader>
		<CardContent>
			<Skeleton className="h-4 w-full mb-2" />
			<Skeleton className="h-4 w-4/5" />
		</CardContent>
		<CardFooter>
			<Skeleton className="h-9 w-24" />
		</CardFooter>
	</Card>
);