export function CurateTabPostCardSkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg space-y-4">
      <div className="space-y-3">
        <div className="flex gap-x-2 items-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-16 bg-gray-200 rounded animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mt-4">
        <div className="h-12 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-12 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
