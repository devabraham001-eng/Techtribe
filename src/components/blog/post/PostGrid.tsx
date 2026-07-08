import * as React from "react";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/blog";
import { PostCard } from "./PostCard";

interface PostGridProps {
  posts: Post[];
  columns?: 1 | 2 | 3 | 4;
  variant?: "vertical" | "horizontal" | "featured";
  showCategory?: boolean;
  showReadingTime?: boolean;
  featuredIndex?: number;
  className?: string;
}

export function PostGrid({
  posts,
  columns = 3,
  variant = "vertical",
  showCategory = true,
  showReadingTime = true,
  featuredIndex = 0,
  className,
}: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4 opacity-20">📝</div>
        <h3 className="font-heading text-xl font-semibold mb-2">No articles yet</h3>
        <p className="text-muted-foreground">Check back soon for new content.</p>
      </div>
    );
  }

  if (variant === "featured" && featuredIndex >= 0 && featuredIndex < posts.length) {
    const featured = posts[featuredIndex];
    const rest = posts.filter((_, i) => i !== featuredIndex);

    return (
      <div className={cn("space-y-8", className)}>
        <PostCard
          post={featured}
          variant="featured"
          showCategory={showCategory}
          showReadingTime={showReadingTime}
        />
        {rest.length > 0 && (
          <div className={cn(
            "grid gap-6",
            getGridCols(columns)
          )}>
            {rest.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                variant="vertical"
          showCategory={showCategory}
          showReadingTime={showReadingTime}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-6",
      getGridCols(columns),
      variant === "horizontal" && "gap-4",
      className
    )}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          variant={variant}
          showCategory={showCategory}
          showReadingTime={showReadingTime}
        />
      ))}
    </div>
  );
}

function getGridCols(columns: number): string {
  switch (columns) {
    case 1: return "grid-cols-1";
    case 2: return "grid-cols-1 sm:grid-cols-2";
    case 3: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    case 4: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    default: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }
}