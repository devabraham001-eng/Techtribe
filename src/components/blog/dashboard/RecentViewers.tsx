"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, ExternalLink, Globe, Monitor } from "lucide-react";

interface Viewer {
  id: string;
  post_id: string;
  viewer_ip: string | null;
  user_agent: string | null;
  referer: string | null;
  viewer_id: string | null;
  viewed_at: string;
  posts: { title: string; slug: string } | { title: string; slug: string }[];
}

function extractBrowser(ua: string | null): string {
  if (!ua) return "Unknown";
  if (ua.includes("Chrome/")) {
    const m = ua.match(/Chrome\/(\d+)/);
    return `Chrome ${m?.[1] ?? ""}`;
  }
  if (ua.includes("Firefox/")) {
    const m = ua.match(/Firefox\/(\d+)/);
    return `Firefox ${m?.[1] ?? ""}`;
  }
  if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    const m = ua.match(/Safari\/(\d+)/);
    return `Safari ${m?.[1] ?? ""}`;
  }
  if (ua.includes("Edge/")) {
    const m = ua.match(/Edge\/(\d+)/);
    return `Edge ${m?.[1] ?? ""}`;
  }
  return "Other";
}

function extractOS(ua: string | null): string {
  if (!ua) return "";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface RecentViewersProps {
  authorId: string;
}

export function RecentViewers({ authorId: _authorId }: RecentViewersProps) {
  const [viewers, setViewers] = React.useState<Viewer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [collapsed, setCollapsed] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/author/views")
      .then((r) => r.json())
      .then((data) => {
        setViewers(data.views ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const displayed = collapsed ? viewers.slice(0, 5) : viewers;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Recent viewers</span>
        </div>
        {!loading && (
          <span className="text-xs text-muted-foreground">{viewers.length}</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : viewers.length === 0 ? (
        <div className="px-4 py-6 text-center text-xs text-muted-foreground">
          No views yet. Share your articles!
        </div>
      ) : (
        <div className="divide-y divide-border">
          {displayed.map((view) => {
            const post = Array.isArray(view.posts) ? view.posts[0] : view.posts;
            const browser = extractBrowser(view.user_agent);
            const os = extractOS(view.user_agent);

            return (
              <div key={view.id} className="px-4 py-2.5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Globe className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">
                      {view.viewer_ip || "Unknown IP"}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">
                    {timeAgo(view.viewed_at)}
                  </span>
                </div>
                {post && (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex items-center gap-1.5 group"
                  >
                    <ExternalLink className="h-3 w-3 flex-shrink-0 text-primary/60" />
                    <span className="text-xs text-foreground truncate group-hover:text-primary transition-colors">
                      {post.title}
                    </span>
                  </Link>
                )}
                {(browser !== "Unknown" || os) && (
                  <div className="flex items-center gap-1.5">
                    <Monitor className="h-3 w-3 flex-shrink-0 text-muted-foreground/60" />
                    <span className="text-[11px] text-muted-foreground/60">
                      {browser}{os ? ` \u00b7 ${os}` : ""}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {viewers.length > 5 && (
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full border-t border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? `Show all ${viewers.length}` : "Show less"}
        </button>
      )}
    </div>
  );
}
