import { Skeleton } from "@/components/ui/skeleton";
import type { UserTokenData } from "@/types";

function HistoryItem({ entry }: { entry: any }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md">
      <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22 12.5C22 18.0228 17.5228 22.5 12 22.5C6.47715 22.5 2 18.0228 2 12.5C2 6.97715 6.47715 2.5 12 2.5C17.5228 2.5 22 6.97715 22 12.5Z"
            stroke="black"
            strokeWidth="1.5"
          />
          <path
            d="M14 10.6278C14 11.042 14.3358 11.3778 14.75 11.3778C15.1642 11.3778 15.5 11.042 15.5 10.6278H14ZM9.75 14.3726C9.75 13.9584 9.41421 13.6226 9 13.6226C8.58579 13.6226 8.25 13.9584 8.25 14.3726H9.75ZM12.75 7.5C12.75 7.08579 12.4142 6.75 12 6.75C11.5858 6.75 11.25 7.08579 11.25 7.5L12.75 7.5ZM11.25 17.5C11.25 17.9142 11.5858 18.25 12 18.25C12.4142 18.25 12.75 17.9142 12.75 17.5H11.25ZM12 11.6062C11.0478 11.6062 10.5431 11.4543 10.2922 11.2864C10.1056 11.1615 10 10.9909 10 10.6278H8.5C8.5 11.3783 8.76936 12.072 9.45777 12.5328C10.0819 12.9507 10.9522 13.1062 12 13.1062V11.6062ZM10 10.6278C10 10.3673 10.1424 10.0682 10.4989 9.80676C10.855 9.54566 11.3833 9.36133 12 9.36133V7.86133C11.0979 7.86133 10.2512 8.1284 9.61196 8.59711C8.97319 9.06549 8.5 9.7746 8.5 10.6278H10ZM12 9.36133C12.6167 9.36133 13.145 9.54566 13.501 9.80676C13.8576 10.0682 14 10.3673 14 10.6278H15.5C15.5 9.77459 15.0268 9.06549 14.388 8.59711C13.7488 8.1284 12.9021 7.86133 12 7.86133V9.36133ZM14.25 14.3726C14.25 14.8084 14.0711 15.0775 13.7369 15.277C13.3572 15.5037 12.7608 15.6391 12 15.6391V17.1391C12.896 17.1391 13.7997 16.9865 14.5057 16.565C15.2573 16.1163 15.75 15.3772 15.75 14.3726H14.25ZM12 15.6391C11.3002 15.6391 10.7004 15.4471 10.2971 15.176C9.88907 14.9018 9.75 14.6036 9.75 14.3726H8.25C8.25 15.2554 8.78251 15.9654 9.46029 16.421C10.1428 16.8797 11.0429 17.1391 12 17.1391V15.6391ZM12 13.1062C12.9582 13.1062 13.5279 13.2501 13.8421 13.4537C14.088 13.6131 14.25 13.854 14.25 14.3726H15.75C15.75 13.451 15.412 12.6837 14.6579 12.1949C13.9721 11.7504 13.0418 11.6062 12 11.6062V13.1062ZM12.75 8.61133L12.75 7.5L11.25 7.5L11.25 8.61133L12.75 8.61133ZM11.25 16.3891V17.5H12.75V16.3891H11.25Z"
            fill="black"
          />
        </svg>
      </div>
      <div className="flex-1">
        <h4 className="text-xl font-semibold">Bought ${entry.amount} worth of tokens</h4>
        <p className="text-emerald-500 font-medium text-sm">+{entry.num} Tokens</p>
      </div>
    </div>
  );
}

function HistoryItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}

export function TokenHistory({ userTokenData, isLoading }: { userTokenData: UserTokenData | undefined; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <HistoryItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-semibold tracking-wide mb-3">History</h3>
      <div className="space-y-4">
        {userTokenData?.transactionHistory.map((entry, index) => (
          <HistoryItem key={index} entry={entry} />
        ))}
      </div>
    </div>
  );
}
