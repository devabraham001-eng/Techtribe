"use client";

import * as React from "react";
import Link from "next/link";
import {
  Edit,
  Eye,
  Trash2,
  FileText,
  Loader2,
  AlertCircle,
  PenLine,
  Plus,
  BarChart2 as BarChartIcon,
  Briefcase,
  Code,
  Filter,
} from "lucide-react";
import { DashboardRightPanel } from "./DashboardRightPanel";
import { RecentViewers } from "./RecentViewers";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/Reveal";
import { useWriteModal } from "./WriteModalContext";

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

  const storyItems = [
    {
      label: "New",
      value: "Article",
      icon: Plus,
      gradient: "from-primary to-primary-dark",
      href: "/blog/write",
    },
    {
      label: "Published",
      value: String(published.length),
      icon: Eye,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      label: "Drafts",
      value: String(drafts.length),
      icon: FileText,
      gradient: "from-yellow-500 to-amber-600",
    },
    {
      label: "Views",
      value: totalViews.toLocaleString(),
      icon: BarChartIcon,
      gradient: "from-primary/60 to-primary-dark",
    },
  ];

  return (
    <div className="flex h-full">
      {/* Center Feed */}
      <div className="flex-1 min-w-0 overflow-y-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
        {/* Stories row */}
        <Reveal direction="up" duration={0.4} delay={0}>
        <div className="flex gap-3 sm:gap-4 mb-6 overflow-x-auto pb-2">
          {storyItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
                <div
                  className={`h-16 w-16 rounded-full bg-gradient-to-br ${item.gradient} p-[2px] flex-shrink-0`}
                >
                  <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground text-center leading-tight">
                  {item.label}
                </span>
                <span className="text-xs font-bold text-foreground -mt-1">
                  {item.value}
                </span>
              </div>
            );
            if (item.label === "New") {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => openWriteModal()}
                  className="hover:opacity-80 transition-opacity text-left"
                >
                  {content}
                </button>
              );
            }
            if (item.href) {
              return (
                <Link key={item.label} href={item.href} className="hover:opacity-80 transition-opacity">
                  {content}
                </Link>
              );
            }
            return (
              <div key={item.label} className="cursor-default">
                {content}
              </div>
            );
          })}
        </div>
        </Reveal>

        {/* Feed header */}
        <Reveal direction="up" duration={0.4} delay={0.1}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-foreground">Your articles</h2>
          <button
            type="button"
            onClick={() => openWriteModal()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            <PenLine className="h-3.5 w-3.5" />
            Write
          </button>
        </div>
        </Reveal>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {actionError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {actionError}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <Reveal direction="up" duration={0.4}>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-card border border-border flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No articles yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Write your first article to see it here.
            </p>
            <button
              type="button"
              onClick={() => openWriteModal()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <PenLine className="h-4 w-4" />
              Write an article
            </button>
          </div>
          </Reveal>
        )}

        {/* Post feed - Instagram style cards */}
        {!loading && !error && posts.length > 0 && (
          <Reveal direction="up" duration={0.4} delay={0.2}>
          {/* Post Type Filter */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setPostTypeFilter("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  postTypeFilter === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPostTypeFilter("article")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  postTypeFilter === "article"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-3 w-3 inline mr-1" />
                Articles
              </button>
              <button
                onClick={() => setPostTypeFilter("project")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  postTypeFilter === "project"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Briefcase className="h-3 w-3 inline mr-1" />
                Projects
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {posts
              .filter((post) => postTypeFilter === "all" || post.post_type === postTypeFilter)
              .map((post) => {
                const statusColor =
                  post.status === "published"
                    ? "text-green-500 bg-green-500/10 border-green-500/20"
                    : post.status === "draft"
                    ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
                    : "text-muted-foreground bg-card border-border";

              return (
                <article
                  key={post.id}
                  className="rounded-xl border border-border bg-card hover:bg-card-hover transition-colors"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${statusColor}`}
                        >
                          {post.status}
                        </span>
                        {post.post_type === "project" && (
                          <Badge variant="secondary" className="gap-1 text-[10px] h-4 px-2">
                            <Briefcase className="h-2.5 w-2.5" />
                            Project
                          </Badge>
                        )}
                        <span className="text-xs text-fg-tertiary">
                          {new Date(post.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openWriteModal(post.id)}
                      className="group block w-full text-left"
                    >
                      <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {post.title}
                      </h3>
                    </button>

                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5 text-xs text-fg-tertiary">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{(post.view_count ?? 0).toLocaleString()} views</span>
                      </div>

                      <div className="ml-auto flex items-center gap-1">
                        {post.status === "published" && (
                          <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                            title="View article"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => openWriteModal(post.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                          title="Edit article"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={deleting === post.id}
                          onClick={() => void handleDelete(post.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                          title="Delete article"
                        >
                          {deleting === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          </Reveal>
        )}
          </div>
        </div>

      {/* Right Panel */}
      <Reveal direction="left" duration={0.4} delay={0.3}>
      <aside className="w-[320px] flex-shrink-0 hidden xl:block border-l border-border overflow-y-auto px-5 py-4">
        <DashboardRightPanel
          authorName={authorName}
          authorBio={authorBio}
          authorAvatar={authorAvatar}
          publishedCount={published.length}
          draftCount={drafts.length}
          totalViews={totalViews}
        />
        <div className="mt-4">
          <RecentViewers authorId={""} />
        </div>
      </aside>
      </Reveal>
    </div>
  );
}


