import { Skeleton } from "./ui/skeleton";

export function TokenInfo({ tokenData, isLoading }: { tokenData: any; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!tokenData) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold tracking-wide mb-3">${tokenData.tokenName}</h3>
      <p className="text-gray-400 mb-6 font-semibold text-base">{tokenData.description}</p>
    </div>
  );
}
