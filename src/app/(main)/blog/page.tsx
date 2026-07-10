"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Briefcase, Code2, GraduationCap, Server, Bot, Clock, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLivePosts } from "@/hooks/useLivePosts";
import type { Post } from "@/types/blog";

const categoryFilters = [
  { name: "All", slug: null, icon: null },
  { name: "Web Dev", slug: "web-development", icon: Code2 },
  { name: "Career", slug: "career-freelancing", icon: Briefcase },
  { name: "DevOps", slug: "backend-devops", icon: Server },
  { name: "AI & Tools", slug: "ai-tools", icon: Bot },
  { name: "Productivity", slug: "productivity", icon: GraduationCap },
];

function BlogCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="bg-card border border-border rounded-xl p-4 sm:p-5 lg:p-6 hover:border-primary/20 hover:bg-card-hover transition-all duration-150 h-full flex flex-col min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3 text-xs">
          {post.category && (
            <span className="font-medium text-primary uppercase tracking-wider">{post.category.name}</span>
          )}
          <span style={{ color: "#636366" }}>&middot;</span>
          <span style={{ color: "#98989d" }}>{formatDate(post.publishedAt || post.createdAt)}</span>
        </div>
        <h2 className="font-heading font-semibold text-base sm:text-lg leading-snug mb-2 group-hover:text-primary transition-colors break-words">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm leading-relaxed mb-3 line-clamp-2 flex-1" style={{ color: "#98989d" }}>
            {post.excerpt}
          </p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(208,242,1,0.08)", color: "#98989d" }}>
                #{tag.name}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-3 border-t border-border">
          <div className="flex min-w-0 items-center gap-1.5 text-xs" style={{ color: "#636366" }}>
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>{post.readingTime} min read</span>
          </div>
          <span className="text-xs font-medium whitespace-nowrap" style={{ color: "#D0F201" }}>
            Read article &rarr;
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPage() {
  const { posts, loading, error, refresh } = useLivePosts();
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let result = posts;
    if (activeFilter) {
      result = result.filter((p) => p.category?.slug === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, activeFilter, searchQuery]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5 lg:pt-6 pb-12 md:pb-16">
      <header className="text-center mx-auto mb-8 sm:mb-10">
        <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-2 sm:mb-3" style={{ color: "#98989d" }}>
          Insights &amp; Tutorials
        </span>
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 sm:mb-3" style={{ color: "#f5f5f7" }}>
          TechTribe Blog
        </h1>
        <p className="text-xs sm:text-sm md:text-base max-w-lg mx-auto" style={{ color: "#98989d" }}>
          Web development tutorials, career insights, and community stories built by the TechTribe team.
        </p>
      </header>

      <div className="mb-8 sm:mb-10">
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(208,242,1,0.1)" }}>
            <Search className="w-5 h-5" style={{ color: "#D0F201" }} />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-semibold text-base mb-1" style={{ color: "#f5f5f7" }}>
              Instant answers from your address bar
            </h3>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#98989d" }}>
              Add TechTribe as a browser search engine, type <code className="px-1 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(208,242,1,0.1)", color: "#D0F201" }}>tt</code> + Tab, search any topic, and jump straight to tutorials. Works across Chrome, Firefox, and Edge.
            </p>
            <Link href="/blog" className="text-xs font-medium" style={{ color: "#D0F201" }}>
              Set it up now &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {categoryFilters.map((cat) => {
            const isActive = cat.slug === activeFilter || (!cat.slug && !activeFilter);
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveFilter(cat.slug === activeFilter ? null : cat.slug)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span className="whitespace-nowrap">{cat.name}</span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#636366" }} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 pl-8 pr-3 py-1.5 rounded-full text-xs border bg-card"
            style={{ borderColor: "#38383a", color: "#f5f5f7" }}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 sm:p-5 lg:p-6 animate-pulse">
              <div className="h-3 w-24 rounded mb-4" style={{ background: "#38383a" }} />
              <div className="h-4 w-full rounded mb-2" style={{ background: "#38383a" }} />
              <div className="h-4 w-3/4 rounded mb-4" style={{ background: "#38383a" }} />
              <div className="h-3 w-full rounded mb-2" style={{ background: "#38383a" }} />
              <div className="h-3 w-2/3 rounded mb-4" style={{ background: "#38383a" }} />
              <div className="h-px w-full my-3" style={{ background: "#38383a" }} />
              <div className="h-3 w-32 rounded" style={{ background: "#38383a" }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-4 py-16 text-center">
          <p className="text-sm font-medium" style={{ color: "#f5f5f7" }}>Could not load articles.</p>
          <p className="mt-2 max-w-md text-sm" style={{ color: "#98989d" }}>{error}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4 opacity-20" aria-hidden="true">TT</div>
          <p className="text-sm" style={{ color: "#98989d" }}>No articles found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
