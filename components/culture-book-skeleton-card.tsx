import { Skeleton } from "@/components/ui/skeleton";

export function CultureBookSkeletonCard() {
  return (
    <div className="bg-white p-4 mx-4 rounded-lg shadow-sm animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-48 w-full mb-3 rounded-lg" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
