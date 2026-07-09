"use client";

import * as React from "react";
import Link from "next/link";
import { Settings, BookOpen, Layers, Users } from "lucide-react";

interface RightPanelProps {
  authorName: string;
  authorBio: string | null;
  authorAvatar: string | null;
  publishedCount: number;
  draftCount: number;
  totalViews: number;
}

export function DashboardRightPanel({
  authorName,
  authorBio,
  authorAvatar,
  publishedCount,
  draftCount,
  totalViews,
}: RightPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-card-hover transition-colors">
        <div className="h-11 w-11 flex-shrink-0 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden">
          {authorAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-fg-tertiary">
              {authorName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate text-foreground">{authorName}</p>
          <p className="text-xs text-muted-foreground truncate">{authorBio || "Author"}</p>
        </div>
        <Link
          href="/settings"
          className="text-xs font-semibold text-primary hover:text-primary-dark flex-shrink-0 transition-colors"
        >
          Edit
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Published</span>
            <span className="text-sm font-semibold text-foreground">{publishedCount}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Drafts</span>
            <span className="text-sm font-semibold text-foreground">{draftCount}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Total views</span>
            <span className="text-sm font-semibold text-foreground">{totalViews.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Suggested
        </p>
        <div className="space-y-1">
          <Link
            href="/blog"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-card-hover hover:text-foreground transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Browse articles
          </Link>
          <Link
            href="/blog/categories"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-card-hover hover:text-foreground transition-colors"
          >
            <Layers className="h-4 w-4" />
            View categories
          </Link>
          <Link
            href="/blog/authors"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-card-hover hover:text-foreground transition-colors"
          >
            <Users className="h-4 w-4" />
            Authors
          </Link>
        </div>
      </div>

      <div className="px-1 pt-2">
        <p className="text-xs text-fg-tertiary">
          &copy; {new Date().getFullYear()} TechTribe
        </p>
      </div>
    </div>
  );
}
