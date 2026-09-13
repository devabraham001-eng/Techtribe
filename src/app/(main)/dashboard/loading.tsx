import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex h-full flex-col xl:flex-row" aria-label="Loading dashboard" role="status">
      <div className="min-w-0 flex-1 space-y-6 overflow-hidden p-5 md:p-7">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 flex-1 rounded-2xl" />
          <Skeleton className="h-10 w-10 rounded-2xl" />
        </div>
        <Skeleton className="h-44 w-full rounded-3xl sm:h-52" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] w-full rounded-2xl" />
          ))}
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-[270px] shrink-0 rounded-2xl border border-border bg-card p-3 sm:w-[300px]">
              <Skeleton className="mb-3 aspect-[16/10] w-full rounded-xl" />
              <Skeleton className="mb-2 h-4 w-16 rounded-full" />
              <Skeleton className="mb-3 h-4 w-full rounded" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <aside className="hidden w-80 shrink-0 space-y-6 border-l border-border p-6 xl:block" aria-hidden="true">
        <div className="flex flex-col items-center">
          <Skeleton className="mb-3 h-16 w-16 rounded-full" />
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="mt-1 h-3 w-44 rounded" />
        </div>
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-32 rounded" />
                <Skeleton className="h-2.5 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
