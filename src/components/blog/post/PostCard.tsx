"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, Eye, Briefcase, Code } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { PostCardProps } from "@/types/blog";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function PostCard({
  post,
  variant = "vertical",
  showCategory = true,
  showReadingTime = true,
  className,
}: PostCardProps) {
  const prefersReduced = useReducedMotion();
  const motionProps = {
    variants: cardVariants,
    initial: "hidden" as const,
    whileInView: "visible" as const,
    viewport: { once: true, margin: "-40px" as const },
    transition: { duration: 0.4, ease: "easeOut" } as const,
  };

  if (variant === "horizontal") {
    if (prefersReduced) {
      return (
        <Link href={`/blog/${post.slug}`} className="group block">
          <article className="flex gap-4 p-4 bg-card border border-border rounded-xl hover:bg-card-hover transition-colors duration-150">
            <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
              {post.coverImageUrl ? (
                <Image
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt || post.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-heading font-bold text-fg-tertiary text-lg">TT</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              {showCategory && post.category && (
                <span className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">{post.category.name}</span>
              )}
              <h3 className="font-heading font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-fg-tertiary">
                <span>{post.author.name}</span>
                {showReadingTime && (<><span>·</span><span>{post.readingTime} min read</span></>)}
              </div>
            </div>
          </article>
        </Link>
      );
    }
    return (
      <motion.div {...motionProps}>
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="flex gap-4 p-4 bg-card border border-border rounded-xl hover:bg-card-hover transition-colors duration-150">
          <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
            {post.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
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
      </motion.div>
    );
  }

  if (variant === "featured") {
    if (prefersReduced) {
      return (
        <Link href={`/blog/${post.slug}`} className="group block">
          <article className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-colors duration-150">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-secondary">
                {post.coverImageUrl ? (
                  <Image
                    src={post.coverImageUrl}
                    alt={post.coverImageAlt || post.title}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-secondary to-secondary">
                    <span className="text-7xl font-heading font-bold text-primary/15">TT</span>
                  </div>
                )}
              </div>
            <div className="flex flex-col justify-center p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                  {showCategory && post.category && <span className="text-xs font-medium text-primary uppercase tracking-wider">{post.category.name}</span>}
                  <span className="text-xs text-fg-tertiary">{formatDate(post.publishedAt || post.createdAt)}</span>
                </div>
                <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">{post.title}</h2>
                {post.excerpt && <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">{post.excerpt}</p>}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-tertiary">
                    <span>{post.author.name}</span>
                    <span>·</span>
                    <div className="flex items-center gap-1"><Eye className="h-3 w-3" /><span>{post.viewCount}</span></div>
                    {showReadingTime && (<><span>·</span><div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{post.readingTime} min</span></div></>)}
                  </div>
                  <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">Read more →</span>
                </div>
              </div>
            </div>
          </article>
        </Link>
      );
    }
    return (
      <motion.div {...motionProps}>
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-colors duration-150">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-secondary">
              {post.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
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
            <div className="flex flex-col justify-center p-4 sm:p-6 lg:p-8">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                {showCategory && post.category && (
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">
                    {post.category.name}
                  </span>
                )}
                <span className="text-xs text-fg-tertiary">
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-tertiary">
                  <span>{post.author.name}</span>
                  <span className="hidden sm:inline">·</span>
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
                <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                  Read more →
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
      </motion.div>
    );
  }

if (prefersReduced) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className={cn("bg-card border border-border rounded-xl hover:border-primary/20 hover:bg-card-hover transition-all duration-150 flex flex-col h-full", className)}>
          <div className="relative aspect-[16/9] overflow-hidden bg-secondary rounded-t-xl">
            {post.coverImageUrl ? (
              <Image
                src={post.coverImageUrl}
                alt={post.coverImageAlt || post.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-secondary to-secondary">
                <span className="text-5xl font-heading font-bold text-primary/15">TT</span>
              </div>
            )}
            {showCategory && post.category && (
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur text-[10px] font-medium text-muted-foreground uppercase tracking-wider border border-border">{post.category.name}</span>
            )}
            {post.postType === "project" && (
              <Badge variant="secondary" className="absolute top-3 right-3 gap-1 text-[10px]">
                <Briefcase className="h-2.5 w-2.5" />
                Project
              </Badge>
            )}
          </div>
          <div className="flex flex-col flex-1 p-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-tertiary mb-2.5">
              {post.postType === "project" && (
                <Badge variant="outline" className="gap-1 text-[10px] h-4">
                  <Briefcase className="h-2.5 w-2.5" />
                  Project
                </Badge>
              )}
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
            <h3 className="font-heading font-semibold text-base leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
            {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{post.excerpt}</p>}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {post.tags.filter((t) => t.type === "tech").slice(0, 2).map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="gap-1 text-[10px] h-4">
                    <Code className="h-2.5 w-2.5" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 text-[11px] text-fg-tertiary"><Eye className="h-3 w-3" /><span>{post.viewCount} views</span></div>
              <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">Read →</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <motion.div {...motionProps}>
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className={cn("bg-card border border-border rounded-xl hover:border-primary/20 hover:bg-card-hover transition-all duration-150 flex flex-col h-full", className)}>
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary rounded-t-xl">
          {post.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
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
          {post.postType === "project" && (
            <Badge variant="secondary" className="absolute top-3 right-3 gap-1 text-[10px]">
              <Briefcase className="h-2.5 w-2.5" />
              Project
            </Badge>
          )}
        </div>
        <div className="flex flex-col flex-1 p-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-tertiary mb-2.5">
            {post.postType === "project" && (
              <Badge variant="secondary" className="gap-1 text-[10px] h-4">
                <Briefcase className="h-2.5 w-2.5" />
                Project
              </Badge>
            )}
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
          {post.tags.filter((t) => t.type === "tech").length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.tags.filter((t) => t.type === "tech").slice(0, 2).map((tag) => (
                <Badge key={tag.id} variant="outline" className="gap-1 text-[10px] h-4 px-2">
                  <Code className="h-2 w-2" />
                  {tag.name}
                </Badge>
              ))}
            </div>
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
    </motion.div>
  );
}
