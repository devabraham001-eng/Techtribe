import { Skeleton } from "@/components/ui/skeleton";

export default function LearnLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8" aria-label="Loading learning dashboard" role="status">
      <div className="flex h-16 items-center justify-between sm:h-20">
        <Skeleton className="h-8 w-40 rounded-full sm:w-72" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-[28px]" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-3 lg:col-span-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] w-full rounded-2xl" />
          ))}
        </div>
        <div className="space-y-3 lg:col-span-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
