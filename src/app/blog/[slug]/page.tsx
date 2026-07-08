"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PostGrid } from "@/components/blog/post/PostGrid";
import { LiveIndicator, LiveViewCount } from "@/components/blog/live/LiveIndicator";
import { useRealtimeViewCount } from "@/hooks/useRealtimeViewCount";
import { formatDate } from "@/lib/utils";
import { DEMO_POSTS } from "@/lib/demo-data";

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = DEMO_POSTS.find((p) => p.slug === slug);

  const { viewCount, refresh } = useRealtimeViewCount(slug, post?.viewCount || 0);

  if (!post) {
    return (
      <div className="max-w-[720px] mx-auto text-center py-20">
        <div className="text-6xl font-heading font-bold text-fg-tertiary/20 mb-4">404</div>
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Article not found</h1>
        <p className="text-sm text-muted-foreground mb-6">The article you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/blog" className="text-sm text-primary hover:underline">Back to blog</Link>
      </div>
    );
  }

  const relatedPosts = DEMO_POSTS.filter(
    (p) => p.slug !== slug && p.category?.slug === post.category?.slug
  ).slice(0, 3);

  return (
    <article className="max-w-[720px] mx-auto">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to blog
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          {post.category && (
            <Link href={`/blog/category/${post.category.slug}`}>
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                {post.category.name}
              </span>
            </Link>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
          <LiveIndicator />
        </div>

        <h1 className="font-heading text-3xl md:text-4xl font-bold leading-tight tracking-tight text-foreground mb-4">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{post.author.name.charAt(0)}</span>
            </div>
            <div>
              <Link href={`/blog/author/${post.author.slug}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                {post.author.name}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground ml-auto">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <time dateTime={post.publishedAt || post.createdAt}>{formatDate(post.publishedAt || post.createdAt)}</time>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{post.readingTime} min</span>
            </div>
            <LiveViewCount count={viewCount} />
          </div>
        </div>
      </header>

      <div className="relative aspect-[2/1] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-secondary to-card border border-border mb-10">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-8xl font-heading font-bold text-primary/10 select-none">TT</span>
        </div>
      </div>

      <div className="prose-custom max-w-none">
        {post.contentMdx.split("\n").map((line, i) => {
          if (line.startsWith("## ")) return <h2 key={i} className="font-heading text-2xl font-semibold tracking-tight mt-10 mb-4 text-foreground">{line.slice(3)}</h2>;
          if (line.startsWith("### ")) return <h3 key={i} className="font-heading text-xl font-semibold tracking-tight mt-8 mb-3 text-foreground">{line.slice(4)}</h3>;
          if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-primary pl-5 italic text-muted-foreground my-8">{line.slice(2)}</blockquote>;
          if (line.startsWith("---")) return <Separator key={i} className="my-10" />;
          if (line.trim() === "") return <div key={i} className="h-4" />;
          if (line.match(/^[*-] /)) return <li key={i} className="text-sm leading-relaxed mb-2 ml-4 list-disc text-muted-foreground">{line.slice(2)}</li>;
          return <p key={i} className="mb-6 leading-relaxed text-sm text-muted-foreground">{line}</p>;
        })}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
          <span className="text-xs text-muted-foreground mr-1">Tags:</span>
          {post.tags.map((tag) => (
            <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                #{tag.name}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Share</span>
        </div>
        <button
          onClick={refresh}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Refresh →
        </button>
      </div>

      <Separator className="my-10" />

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-primary">{post.author.name.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <Link href={`/blog/author/${post.author.slug}`} className="font-heading font-semibold text-sm text-foreground hover:text-primary transition-colors">
              {post.author.name}
            </Link>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{post.author.bio}</p>
          </div>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-5">Related articles</h2>
          <PostGrid posts={relatedPosts} variant="vertical" columns={3} showCategory={false} />
        </div>
      )}
    </article>
  );
}
