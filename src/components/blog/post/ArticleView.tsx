"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Share2, Copy, Tag, Briefcase, Code, Users } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LiveIndicator, LiveViewCount } from "@/components/blog/live/LiveIndicator";
import { PostGrid } from "@/components/blog/post/PostGrid";
import { MdxRenderer } from "@/components/markdown/MdxRenderer";
import { ReactionBar } from "@/components/blog/post/ReactionBar";
import { AnnotationLayer } from "@/components/blog/post/AnnotationLayer";
import { CommentSection } from "@/components/blog/post/CommentSection";
import { Reveal } from "@/components/motion/Reveal";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useRealtimeViewCount } from "@/hooks/useRealtimeViewCount";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/types/blog";

interface ArticleViewProps {
  post: Post;
  relatedPosts: Post[];
  prevPost?: Post | null;
  nextPost?: Post | null;
}

export function ArticleView({ post, relatedPosts, prevPost, nextPost }: ArticleViewProps) {
  const { viewCount, refresh } = useRealtimeViewCount(post.slug, post.viewCount);
  const contentRef = React.useRef<HTMLDivElement>(null);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = post.title;
    const text = post.excerpt || title;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch {
      alert("Could not copy link. Please copy manually: " + url);
    }
  }

  return (
    <article className="max-w-[720px] mx-auto px-4 sm:px-0 pt-6 lg:pt-8 pb-12">
      <Reveal direction="left" duration={0.3}>
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to blog
      </Link>
      </Reveal>

      <header className="mb-8">
        <Reveal direction="up" duration={0.4}>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {post.category && (
            <Link href={`/blog/category/${post.category.slug}`}>
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                {post.category.name}
              </span>
            </Link>
          )}
          {post.postType === "project" && (
            <Badge variant="secondary" className="gap-1">
              <Briefcase className="h-2.5 w-2.5" />
              Project
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
          <LiveIndicator />
        </div>
        </Reveal>

        <Reveal direction="up" duration={0.4} delay={0.1}>
        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight text-foreground mb-4">
          {post.title}
        </h1>
        </Reveal>

        {post.excerpt && (
          <Reveal direction="up" duration={0.4} delay={0.2}>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
            {post.excerpt}
          </p>
          </Reveal>
        )}

        <Reveal direction="up" duration={0.4} delay={0.25}>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-5 pt-4 border-t border-border">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.avatarUrl || ""} alt={post.author.name} />
              <AvatarFallback className="text-xs font-bold text-primary bg-primary/20">
                {post.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Link
              href={`/blog/author/${post.author.slug}`}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {post.author.name}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:ml-auto">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <time dateTime={post.publishedAt || post.createdAt}>
                {formatDate(post.publishedAt || post.createdAt)}
              </time>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{post.readingTime} min</span>
            </div>
            <LiveViewCount count={viewCount} />
          </div>
        </div>
        </Reveal>
      </header>

      <Reveal direction="up" duration={0.4} delay={0.3}>
      {post.coverImageUrl ? (
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-card border border-border mb-8 sm:mb-10">
          <img
            src={post.coverImageUrl}
            alt={post.coverImageAlt || post.title}
            className="w-full h-auto object-contain"
          />
        </div>
      ) : (
        <div className="relative aspect-[2/1] rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-secondary to-card border border-border mb-8 sm:mb-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl font-heading font-bold text-primary/10 select-none">
              TT
            </span>
          </div>
        </div>
      )}
      </Reveal>

      <Reveal direction="up" duration={0.4} delay={0.35}>
      <div ref={contentRef}>
        {post.contentMdx ? (
          <MdxRenderer content={post.contentMdx} />
        ) : (
          <p className="text-sm text-muted-foreground">
            This article is being prepared for publication.
          </p>
        )}
      </div>
      </Reveal>

      {post.tags.length > 0 && (
        <Reveal direction="up" duration={0.4} delay={0.4}>
        <div className="flex flex-wrap gap-2 mt-8 sm:mt-10 pt-6 border-t border-border">
          {post.tags.filter((t) => t.type === "tech").length > 0 && (
            <div className="w-full sm:w-auto mb-2 sm:mb-0 mr-4">
              <span className="text-xs text-primary font-medium mr-2">Tech Stack:</span>
              {post.tags.filter((t) => t.type === "tech").map((tag) => (
                <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors inline-block">
                    {tag.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
          {post.tags.filter((t) => t.type === "general").length > 0 && (
            <div className="w-full sm:w-auto">
              <span className="text-xs text-muted-foreground mr-2">Tags:</span>
              {post.tags.filter((t) => t.type === "general").map((tag) => (
                <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors inline-block">
                    #{tag.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
        </Reveal>
      )}

      <Reveal direction="up" duration={0.4} delay={0.45}>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-4 border-t border-border">
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
        <button
          type="button"
          onClick={refresh}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Refresh &rarr;
        </button>
      </div>
      </Reveal>

      <Reveal direction="up" duration={0.4} delay={0.48}>
      <ReactionBar slug={post.slug} />
      <AnnotationLayer slug={post.slug} contentRef={contentRef} />
      </Reveal>

      <Reveal direction="up" duration={0.4} delay={0.52}>
      <CommentSection slug={post.slug} />
      </Reveal>

      <Reveal direction="up" duration={0.4} delay={0.56}>
      <Separator className="my-8 sm:my-10" />
      </Reveal>

      <Reveal direction="up" duration={0.4} delay={0.6}>
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4 flex-wrap">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
            <AvatarImage src={post.author.avatarUrl || ""} alt={post.author.name} />
            <AvatarFallback className="text-sm sm:font-bold text-primary bg-primary/20">
              {post.author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/blog/author/${post.author.slug}`}
                className="font-heading font-semibold text-sm text-foreground hover:text-primary transition-colors"
              >
                {post.author.name}
              </Link>
              {post.author.status && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  {post.author.status === "open_to_work" && (
                    <>
                      <Briefcase className="h-2.5 w-2.5" />
                      Open to Work
                    </>
                  )}
                  {post.author.status === "hiring" && (
                    <>
                      <Users className="h-2.5 w-2.5" />
                      Hiring
                    </>
                  )}
                  {(post.author.status === "mentoring" || post.author.status === "open_for_mentorship") && (
                    <>
                      <Code className="h-2.5 w-2.5" />
                      Mentoring
                    </>
                  )}
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              {post.author.bio}
            </p>
          </div>
        </div>
      </div>
      </Reveal>

      {(prevPost || nextPost) && (
        <Reveal direction="up" duration={0.4} delay={0.55}>
        <nav className="mt-8 sm:mt-12 flex items-center justify-between gap-3" aria-label="Article navigation">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:text-primary hover:border-primary/30 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Link>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:text-primary hover:border-primary/30 transition-colors ml-auto"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <div />
          )}
        </nav>
        </Reveal>
      )}

      {relatedPosts.length > 0 && (
        <Reveal direction="up" duration={0.4} delay={0.6}>
        <div className="mt-10 sm:mt-12">
          <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground mb-5">
            Related articles
          </h2>
          <PostGrid
            posts={relatedPosts}
            variant="vertical"
            columns={3}
            showCategory={false}
          />
        </div>
        </Reveal>
      )}
    </article>
  );
}
