import * as React from "react";
import Link from "next/link";
import { Clock, Eye, TrendingUp } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { PostCardProps } from "@/types/blog";

export function PostCard({
  post,
  variant = "vertical",
  showCategory = true,
  showReadingTime = true,
  className,
}: PostCardProps) {
  if (variant === "horizontal") {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="flex gap-4 p-4 bg-card border border-border rounded-xl hover:bg-card-hover transition-colors duration-150">
          <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
            {post.coverImageUrl ? (
              <img
                src={post.coverImageUrl}
                alt={post.coverImageAlt || post.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-heading font-bold text-fg-tertiary text-lg">TT</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            {showCategory && post.category && (
              <span className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">
                {post.category.name}
              </span>
            )}
            <h3 className="font-heading font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-fg-tertiary">
              <span>{post.author.name}</span>
              {showReadingTime && (
                <>
                  <span>·</span>
                  <span>{post.readingTime} min read</span>
                </>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-colors duration-150">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-secondary">
              {post.coverImageUrl ? (
                <img
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt || post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-secondary to-secondary">
                  <span className="text-7xl font-heading font-bold text-primary/15">TT</span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-3">
                {showCategory && post.category && (
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">
                    {post.category.name}
                  </span>
                )}
                <span className="text-xs text-fg-tertiary">
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
              </div>
              <h2 className="font-heading text-2xl lg:text-3xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3 text-xs text-fg-tertiary">
                  <span>{post.author.name}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{post.viewCount}</span>
                  </div>
                  {showReadingTime && (
                    <>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readingTime} min</span>
                      </div>
                    </>
                  )}
                </div>
                <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more →
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className={cn("bg-card border border-border rounded-xl hover:border-primary/20 hover:bg-card-hover transition-all duration-150 flex flex-col h-full", className)}>
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary rounded-t-xl">
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.coverImageAlt || post.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-secondary to-secondary">
              <span className="text-5xl font-heading font-bold text-primary/15">TT</span>
            </div>
          )}
          {showCategory && post.category && (
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur text-[10px] font-medium text-muted-foreground uppercase tracking-wider border border-border">
              {post.category.name}
            </span>
          )}
        </div>
        <div className="flex flex-col flex-1 p-4">
          <div className="flex items-center gap-2 text-xs text-fg-tertiary mb-2.5">
            <span>{post.author.name}</span>
            <span>·</span>
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            {showReadingTime && (
              <>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readingTime} min</span>
                </div>
              </>
            )}
          </div>
          <h3 className="font-heading font-semibold text-base leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-[11px] text-fg-tertiary">
              <Eye className="h-3 w-3" />
              <span>{post.viewCount} views</span>
            </div>
            <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Read →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}