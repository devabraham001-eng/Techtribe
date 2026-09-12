"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  BarChart2 as BarChartIcon,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Edit,
  EllipsisVertical,
  Eye,
  FileText,
  Layers,
  Loader2,
  Mail,
  PenLine,
  Play,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { RecentViewers } from "./RecentViewers";
import { Reveal } from "@/components/motion/Reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { useWriteModal } from "./WriteModalContext";
import { cn } from "@/lib/utils";

interface PostSummary {
  id: string;
  slug: string;
  title: string;
  status: string;
  view_count: number;
  published_at: string | null;
  created_at: string;
  post_type: string;
}

interface DashboardProps {
  authorId: string;
  authorName: string;
  authorBio: string | null;
  authorAvatar: string | null;
  isStaff: boolean;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/* Center: search                                                      */
/* ------------------------------------------------------------------ */

function DashboardSearch({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: "all" | "draft" | "published";
  onStatusFilterChange: (value: "all" | "draft" | "published") => void;
}) {
  const [filterOpen, setFilterOpen] = React.useState(false);
  const filterRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!filterOpen) return;
    function handleClick(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [filterOpen]);

  const statusOptions: { value: "all" | "draft" | "published"; label: string }[] = [
    { value: "all", label: "All statuses" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Drafts" },
  ];

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </span>
        <label htmlFor="dashboard-search" className="sr-only">
          Search your articles here
        </label>
        <input
          id="dashboard-search"
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search your articles here....."
          className="w-full rounded-2xl border border-border bg-card py-2.5 pl-11 pr-4 text-xs text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm"
        />
      </div>
      <div ref={filterRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setFilterOpen((prev) => !prev)}
          aria-label="Filter articles by status"
          aria-expanded={filterOpen}
          title="Filter by status"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-2xl border shadow-sm transition-all",
            statusFilter !== "all" || filterOpen
              ? "border-primary/50 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
        {filterOpen && (
          <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onStatusFilterChange(option.value);
                  setFilterOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-medium transition-colors",
                  statusFilter === option.value
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
                )}
              >
                {option.label}
                {statusFilter === option.value && <span aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Center: hero                                                        */
/* ------------------------------------------------------------------ */

function DashboardHero({ onWrite }: { onWrite: () => void }) {
  return (
    <section
      aria-labelledby="dashboard-hero-heading"
      className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary via-background to-card p-6 text-foreground shadow-lg sm:p-8"
    >
      <div
        className="pointer-events-none absolute right-12 top-6 h-24 w-24 rounded-full bg-primary/[0.07] blur-xl"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute right-28 top-6 opacity-20" aria-hidden="true">
        <div className="h-14 w-14 bg-gradient-to-tr from-primary to-primary/20 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]" />
      </div>
      <div className="pointer-events-none absolute bottom-6 right-12 opacity-15" aria-hidden="true">
        <div className="h-20 w-20 bg-gradient-to-tr from-primary to-primary/20 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]" />
      </div>
      <div className="relative z-10 max-w-md">
        <span className="mb-2.5 inline-block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Author Dashboard
        </span>
        <h1
          id="dashboard-hero-heading"
          className="mb-6 font-heading text-xl font-bold leading-tight tracking-tight sm:text-2xl md:text-3xl"
        >
          Publish Articles and Grow Your Audience
        </h1>
        <button
          type="button"
          onClick={onWrite}
          className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:bg-primary-dark"
        >
          <span>Write Now</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-[10px] text-primary transition-transform group-hover:scale-105">
            <PenLine className="h-2.5 w-2.5" aria-hidden="true" />
          </span>
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Center: stat pills                                                  */
/* ------------------------------------------------------------------ */

function StatPills({
  publishedCount,
  draftCount,
  totalViews,
  statusFilter,
  onStatusFilterChange,
}: {
  publishedCount: number;
  draftCount: number;
  totalViews: number;
  statusFilter: "all" | "draft" | "published";
  onStatusFilterChange: (value: "all" | "draft" | "published") => void;
}) {
  const pills = [
    {
      key: "published" as const,
      top: `${publishedCount} Published`,
      title: "Published articles",
      icon: Eye,
      clickable: true,
    },
    {
      key: "draft" as const,
      top: `${draftCount} Drafts`,
      title: "Draft articles",
      icon: FileText,
      clickable: true,
    },
    {
      key: null,
      top: `${totalViews.toLocaleString()} Views`,
      title: "Total views",
      icon: BarChartIcon,
      clickable: false,
    },
  ];

  return (
    <section aria-label="Article statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {pills.map((pill) => {
        const Icon = pill.icon;
        const isActive = pill.key !== null && statusFilter === pill.key;
        return (
          <button
            key={pill.title}
            type="button"
            disabled={!pill.clickable}
            onClick={() => {
              if (pill.key) onStatusFilterChange(isActive ? "all" : pill.key);
            }}
            aria-pressed={pill.clickable ? isActive : undefined}
            className={cn(
              "flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/[0.06] p-3 text-left shadow-sm transition",
              pill.clickable ? "hover:bg-primary/[0.1]" : "cursor-default",
              isActive && "ring-2 ring-primary"
            )}
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[10px] font-medium text-muted-foreground">{pill.top}</span>
                <span className="block text-xs font-bold text-foreground">{pill.title}</span>
              </span>
            </span>
            <EllipsisVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </button>
        );
      })}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Center: recent article cards                                        */
/* ------------------------------------------------------------------ */

function RecentArticleCards({
  posts,
  maxViews,
  authorName,
  authorAvatar,
  onEdit,
}: {
  posts: PostSummary[];
  maxViews: number;
  authorName: string;
  authorAvatar: string | null;
  onEdit: (id: string) => void;
}) {
  const trackRef = React.useRef<HTMLDivElement>(null);

  function scrollCards(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="recent-articles-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="recent-articles-heading" className="font-heading text-base font-bold text-foreground">
          Recent Articles
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollCards(-1)}
            aria-label="Scroll articles left"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollCards(1)}
            aria-label="Scroll articles right"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div ref={trackRef} className="flex snap-x gap-4 overflow-x-auto pb-1">
        {posts.slice(0, 6).map((post) => {
          const isProject = post.post_type === "project";
          const viewsPct = maxViews > 0 ? Math.max(Math.round(((post.view_count ?? 0) / maxViews) * 100), post.view_count > 0 ? 4 : 0) : 0;
          return (
            <article
              key={post.id}
              className="flex w-[270px] shrink-0 snap-start flex-col justify-between rounded-2xl border border-border bg-card p-3 shadow-sm sm:w-[300px]"
            >
              <div>
                <button
                  type="button"
                  onClick={() => onEdit(post.id)}
                  aria-label={`Edit ${post.title}`}
                  className="group relative mb-3 block aspect-[16/10] w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/25 via-secondary to-card"
                >
                  <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                    {isProject ? (
                      <Briefcase className="h-12 w-12 text-primary/30" strokeWidth={1.5} />
                    ) : (
                      <FileText className="h-12 w-12 text-primary/30" strokeWidth={1.5} />
                    )}
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                      <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
                    </span>
                  </span>
                </button>
                <span
                  className={cn(
                    "mb-2 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider",
                    post.status === "published"
                      ? "bg-primary/10 text-primary"
                      : "bg-amber-500/10 text-amber-500"
                  )}
                >
                  {post.status.toUpperCase()}
                </span>
                <h3 className="mb-3 line-clamp-2 text-xs font-bold leading-relaxed text-foreground">
                  <button type="button" onClick={() => onEdit(post.id)} className="text-left hover:text-primary">
                    {post.title}
                  </button>
                </h3>
              </div>
              <div>
                <div
                  className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
                  role="progressbar"
                  aria-valuenow={viewsPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${post.view_count ?? 0} views on ${post.title}`}
                >
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${viewsPct}%` }} />
                </div>
                <p className="mb-2 text-[10px] font-medium text-muted-foreground">
                  {(post.view_count ?? 0).toLocaleString()} views
                </p>
                <div className="flex items-center gap-2 border-t border-border pt-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-[10px] font-bold text-muted-foreground">
                    {authorAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={authorAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      authorName.charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="leading-none">
                    <span className="block truncate text-[11px] font-semibold text-foreground">{authorName}</span>
                    <span className="mt-0.5 block text-[9px] text-muted-foreground">{formatDate(post.created_at)}</span>
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Center: articles table                                              */
/* ------------------------------------------------------------------ */

function ArticlesTable({
  posts,
  loading,
  postTypeFilter,
  onPostTypeFilterChange,
  onWrite,
  onEdit,
  onDelete,
  deletingId,
}: {
  posts: PostSummary[];
  loading: boolean;
  postTypeFilter: "all" | "article" | "project";
  onPostTypeFilterChange: (value: "all" | "article" | "project") => void;
  onWrite: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  return (
    <section aria-labelledby="your-articles-heading" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="your-articles-heading" className="font-heading text-sm font-bold text-foreground">
          Your Articles
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-secondary p-1" role="group" aria-label="Filter by type">
            {(["all", "article", "project"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onPostTypeFilterChange(type)}
                aria-pressed={postTypeFilter === type}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                  postTypeFilter === type
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type === "all" ? "All" : `${type}s`}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onWrite}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary-dark"
          >
            <PenLine className="h-3.5 w-3.5" aria-hidden="true" /> Write
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-7 w-7 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-2/3 rounded" />
                <Skeleton className="h-2.5 w-1/3 rounded" />
              </div>
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary">
            <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-foreground">No articles found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try a different search or filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase text-muted-foreground">
                <th className="pb-3 pr-3 font-semibold">Article &amp; Date</th>
                <th className="pb-3 pr-3 font-semibold">Type</th>
                <th className="pb-3 pr-3 font-semibold">Views</th>
                <th className="pb-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="transition hover:bg-card-hover/50">
                  <td className="py-3 pr-3">
                    <button type="button" onClick={() => onEdit(post.id)} className="block max-w-[280px] text-left">
                      <span className="block truncate font-bold leading-tight text-foreground hover:text-primary">
                        {post.title}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">
                        {formatDate(post.created_at)} · {post.status}
                      </span>
                    </button>
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={cn(
                        "inline-block rounded-md px-2.5 py-1 text-[10px] font-bold",
                        post.post_type === "project"
                          ? "bg-purple-500/10 text-purple-500"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {post.post_type === "project" ? "PROJECT" : "ARTICLE"}
                    </span>
                  </td>
                  <td className="py-3 pr-3 font-medium text-muted-foreground">
                    {(post.view_count ?? 0).toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center justify-end gap-1">
                      {post.status === "published" && (
                        <Link
                          href={`/blog/${post.slug}`}
                          title="View article"
                          aria-label={`View ${post.title}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => onEdit(post.id)}
                        title="Edit article"
                        aria-label={`Edit ${post.title}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === post.id}
                        onClick={() => onDelete(post.id)}
                        title="Delete article"
                        aria-label={`Delete ${post.title}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        {deletingId === post.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Right rail                                                          */
/* ------------------------------------------------------------------ */

function ActivityChart({ posts }: { posts: PostSummary[] }) {
  const bars = posts
    .filter((p) => p.status === "published")
    .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
    .slice(0, 7);
  const max = Math.max(...bars.map((b) => b.view_count ?? 0), 0);

  if (bars.length === 0 || max === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card px-4 py-6 text-center">
        <p className="text-xs text-muted-foreground">No views yet. Share your articles!</p>
      </div>
    );
  }

  return (
    <div
      className="flex h-28 items-end justify-between gap-2 rounded-2xl bg-primary/[0.06] px-4 py-2"
      role="img"
      aria-label={`Article views chart. Top article has ${max.toLocaleString()} views.`}
    >
      {bars.map((post, i) => {
        const height = Math.max(Math.round(((post.view_count ?? 0) / max) * 96), 6);
        return (
          <div key={post.id} className="flex h-full flex-1 flex-col items-center justify-end" title={`${post.title}: ${(post.view_count ?? 0).toLocaleString()} views`}>
            <div
              className={cn("w-full max-w-[18px] rounded-sm bg-primary", i % 3 === 1 && "opacity-60", i % 3 === 2 && "opacity-30")}
              style={{ height: `${height}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

function DashboardRail({
  authorName,
  authorBio,
  authorAvatar,
  onWrite,
}: {
  authorName: string;
  authorBio: string | null;
  authorAvatar: string | null;
  onWrite: () => void;
}) {
  const [greeting] = React.useState(getGreeting);
  const firstName = authorName.split(" ")[0];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Your Profile</h2>
        <Link
          href="/settings"
          aria-label="Open settings"
          title="Open settings"
          className="text-muted-foreground transition hover:text-foreground"
        >
          <EllipsisVertical className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 rounded-full bg-[conic-gradient(from_0deg,#D0F201_0%,#D0F20155_45%,#38383a_65%,#38383a_100%)] p-1">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-background p-0.5 text-lg font-bold text-muted-foreground">
            {authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={authorAvatar} alt={authorName} className="h-full w-full rounded-full object-cover" />
            ) : (
              authorName.charAt(0).toUpperCase()
            )}
          </div>
        </div>
        <h3 className="text-sm font-bold text-foreground">
          {greeting} {firstName}
        </h3>
        <p className="mt-0.5 max-w-[220px] truncate text-[11px] text-muted-foreground">
          {authorBio || "Continue Your Journey And Achieve Your Target"}
        </p>
        <div className="mt-4 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onWrite}
            title="Write an article"
            aria-label="Write an article"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary/50 hover:text-primary"
          >
            <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <Link
            href="/blog"
            title="Browse articles"
            aria-label="Browse articles"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary/50 hover:text-primary"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <Link
            href="/settings"
            title="Open settings"
            aria-label="Open settings"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary/50 hover:text-primary"
          >
            <Settings className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="mb-7">
        <RecentViewers authorId={""} />
      </div>

      <div>
        <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Suggested
        </p>
        <div className="space-y-1">
          <Link
            href="/blog"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground"
          >
            <FileText className="h-4 w-4" aria-hidden="true" /> Browse articles
          </Link>
          <Link
            href="/blog/categories"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground"
          >
            <Layers className="h-4 w-4" aria-hidden="true" /> View categories
          </Link>
          <Link
            href="/blog/authors"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Authors
          </Link>
        </div>
      </div>

      <div className="px-1 pt-6">
        <p className="text-xs text-fg-tertiary">&copy; {new Date().getFullYear()} TechTribe</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard assembly                                                  */
/* ------------------------------------------------------------------ */

export function AuthorDashboardClient({
  authorName,
  authorBio,
  authorAvatar,
}: DashboardProps) {
  const [posts, setPosts] = React.useState<PostSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [postTypeFilter, setPostTypeFilter] = React.useState<"all" | "article" | "project">("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "draft" | "published">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const { openWriteModal } = useWriteModal();

  async function loadPosts() {
    setLoading(true);
    setError(null);
    setActionError(null);
    try {
      const res = await fetch(`/api/author/posts?limit=50`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load posts");
      }
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadPosts();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  React.useEffect(() => {
    const handlePostsChanged = () => {
      void loadPosts();
    };

    window.addEventListener("techtribe:author-posts-changed", handlePostsChanged);
    return () => window.removeEventListener("techtribe:author-posts-changed", handlePostsChanged);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this article permanently?")) return;
    setDeleting(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/author/posts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  }

  const published = posts.filter((p) => p.status === "published");
  const drafts = posts.filter((p) => p.status === "draft");
  const totalViews = published.reduce((sum, p) => sum + (p.view_count ?? 0), 0);
  const maxViews = published.reduce((max, p) => Math.max(max, p.view_count ?? 0), 0);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredPosts = posts
    .filter((post) => postTypeFilter === "all" || post.post_type === postTypeFilter)
    .filter((post) => statusFilter === "all" || post.status === statusFilter)
    .filter((post) => !normalizedQuery || post.title.toLowerCase().includes(normalizedQuery));

  const writeNow = () => openWriteModal();
  const editPost = (id: string) => openWriteModal(id);

  return (
    <div className="flex h-full flex-col xl:flex-row">
      {/* Center column */}
      <div className="min-w-0 flex-1 space-y-6 overflow-y-auto p-5 md:p-7">
        <DashboardSearch
          query={searchQuery}
          onQueryChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <Reveal direction="up" duration={0.4} delay={0}>
          <DashboardHero onWrite={writeNow} />
        </Reveal>

        <Reveal direction="up" duration={0.4} delay={0.05}>
          <StatPills
            publishedCount={published.length}
            draftCount={drafts.length}
            totalViews={totalViews}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </Reveal>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {actionError && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {actionError}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-3">
                <Skeleton className="mb-3 aspect-[16/10] w-full rounded-xl" />
                <Skeleton className="mb-2 h-4 w-16 rounded-full" />
                <Skeleton className="mb-3 h-4 w-full rounded" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-secondary">
              <FileText className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="font-semibold text-foreground">No articles yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Write your first article to see it here.
            </p>
            <button
              type="button"
              onClick={writeNow}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              <PenLine className="h-4 w-4" aria-hidden="true" />
              Write an article
            </button>
          </div>
        ) : (
          <Reveal direction="up" duration={0.4} delay={0.1}>
            <RecentArticleCards
              posts={posts}
              maxViews={maxViews}
              authorName={authorName}
              authorAvatar={authorAvatar}
              onEdit={editPost}
            />
          </Reveal>
        )}

        {!loading && !error && posts.length > 0 && (
          <Reveal direction="up" duration={0.4} delay={0.15}>
            <ArticlesTable
              posts={filteredPosts}
              loading={false}
              postTypeFilter={postTypeFilter}
              onPostTypeFilterChange={setPostTypeFilter}
              onWrite={writeNow}
              onEdit={editPost}
              onDelete={(id) => void handleDelete(id)}
              deletingId={deleting}
            />
          </Reveal>
        )}

        {/* Right rail content stacked below center on smaller screens */}
        <div className="border-t border-border pt-6 xl:hidden">
          <DashboardRail
            authorName={authorName}
            authorBio={authorBio}
            authorAvatar={authorAvatar}
            onWrite={writeNow}
          />
          <div className="mt-6">
            <ActivityChart posts={posts} />
          </div>
        </div>
      </div>

      {/* Right rail */}
      <Reveal direction="left" duration={0.4} delay={0.2}>
        <aside className="hidden w-80 shrink-0 flex-col justify-between overflow-y-auto border-l border-border bg-background p-6 xl:flex">
          <div>
            <DashboardRail
              authorName={authorName}
              authorBio={authorBio}
              authorAvatar={authorAvatar}
              onWrite={writeNow}
            />
            <div className="mt-6">
              <ActivityChart posts={posts} />
            </div>
          </div>
          <div className="pt-6">
            <button
              type="button"
              onClick={writeNow}
              className="w-full rounded-2xl bg-primary/10 py-2.5 text-xs font-semibold text-primary shadow-sm transition duration-150 hover:bg-primary/20"
            >
              Write an Article
            </button>
          </div>
        </aside>
      </Reveal>
    </div>
  );
}
