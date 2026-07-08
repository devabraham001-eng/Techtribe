import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-secondary/60", className)}
      {...props}
    />
  );
}

export function PostCardSkeleton({ variant = "vertical" }: { variant?: "vertical" | "horizontal" | "featured" }) {
  if (variant === "horizontal") {
    return (
      <div className="flex gap-4 p-4 bg-card border border-border rounded-xl">
        <Skeleton className="h-20 w-20 rounded-lg flex-shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <Skeleton className="aspect-[4/3] md:aspect-auto" />
          <div className="p-6 lg:p-8 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center gap-3 pt-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function PostGridSkeleton({ count = 6, columns = 3, variant = "vertical" }: { count?: number; columns?: number; variant?: "vertical" | "horizontal" | "featured" }) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={`grid gap-6 ${gridCols[columns as keyof typeof gridCols] || gridCols[3]}`}>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="max-w-[720px] mx-auto space-y-6">
      <Skeleton className="h-4 w-24" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex items-center gap-4 pt-2">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-3 ml-auto">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <Skeleton className="aspect-[2/1] rounded-2xl" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className={i % 3 === 0 ? "h-4 w-3/4" : "h-4 w-full"} />
      ))}
    </div>
  );
}