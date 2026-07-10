"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Briefcase, Code2, GraduationCap, Server, Bot, Clock } from "lucide-react";
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
      <article className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:border-primary/20 hover:bg-card-hover transition-all duration-150 h-full flex flex-col">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3 text-xs">
          {post.category && (
            <span className="font-medium text-primary uppercase tracking-wider">{post.category.name}</span>
          )}
          <span style={{ color: "#636366" }}>·</span>
          <span style={{ color: "#98989d" }}>{formatDate(post.publishedAt || post.createdAt)}</span>
        </div>
        <h2 className="font-heading font-semibold text-base sm:text-lg leading-snug mb-2 group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm leading-relaxed mb-4 line-clamp-2 flex-1" style={{ color: "#98989d" }}>
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#636366" }}>
            <Clock className="w-3 h-3" />
            <span>{post.readingTime} min read</span>
          </div>
          <span className="text-xs font-medium" style={{ color: "#D0F201" }}>
            Read article &rarr;
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPage() {
  const { posts, loading } = useLivePosts();
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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-12">
      {/* ───── Blog Hero ───── */}
      <header className="max-w-2xl mb-8 sm:mb-10">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#98989d" }}>
          Insights &amp; Tutorials
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ color: "#f5f5f7" }}>
          TechTribe Blog
        </h1>
        <p className="text-sm sm:text-base max-w-lg" style={{ color: "#98989d" }}>
          Web development tutorials, career insights, and community stories — built by the TechTribe team.
        </p>
      </header>

      {/* ───── Promo ───── */}
      <div className="mb-8 sm:mb-10">
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(208,242,1,0.1)" }}>
            <Search className="w-5 h-5" style={{ color: "#D0F201" }} />
          </div>
          <div>
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

      {/* ───── Filters ───── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {categoryFilters.map((cat) => {
            const isActive = cat.slug === activeFilter || (!cat.slug && !activeFilter);
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveFilter(cat.slug === activeFilter ? null : cat.slug)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {cat.name}
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

      {/* ───── Posts ───── */}
      {loading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 sm:p-6 animate-pulse">
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
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4 opacity-20">📝</div>
          <p className="text-sm" style={{ color: "#98989d" }}>No articles found.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
