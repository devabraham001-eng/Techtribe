"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { MessageSquare, Bell, Plus, Check } from "lucide-react";
import type { Author } from "@/types/blog";

function getGradient(status: Author["status"]): string {
  switch (status) {
    case "open_to_work":
    case "hiring":
      return "bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400";
    case "mentoring":
    case "open_for_mentorship":
      return "bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400";
    default:
      return "bg-gradient-to-br from-rose-300 via-amber-200 to-sky-300";
  }
}

function getStatusBadge(status: Author["status"]): { label: string; className: string } {
  switch (status) {
    case "open_to_work":
      return { label: "Available to Work", className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" };
    case "hiring":
      return { label: "Hiring", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
    case "mentoring":
      return { label: "Mentor", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" };
    case "open_for_mentorship":
      return { label: "Open to Mentor", className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" };
    default:
      return { label: "Author", className: "bg-muted text-muted-foreground" };
  }
}

interface AuthorCardProps {
  author: Author;
  articleCount: number;
}

export function AuthorCard({ author, articleCount }: AuthorCardProps) {
  const [following, setFollowing] = React.useState(false);
  const gradient = getGradient(author.status);
  const statusBadge = getStatusBadge(author.status);

  return (
    <div className="group rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* Gradient header */}
      <div className={`h-32 ${gradient}`} />

      {/* Content */}
      <div className="relative px-6 pb-6">
        {/* Avatar overlapping gradient */}
        <div className="-mt-10 mb-3">
          <Link href={`/blog/author/${author.slug}`}>
            <Avatar className="h-20 w-20 border-4 border-card">
              <AvatarImage src={author.avatarUrl || ""} alt={author.name} />
              <AvatarFallback className="text-xl">{getInitials(author.name)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>

        {/* Name */}
        <Link href={`/blog/author/${author.slug}`}>
          <h2 className="font-heading text-xl font-semibold hover:text-primary transition-colors">
            {author.name}
          </h2>
        </Link>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="subtle" className={`text-[10px] ${statusBadge.className}`}>
            {statusBadge.label}
          </Badge>
          {author.isStaff && (
            <Badge variant="subtle" className="text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Golden User
            </Badge>
          )}
          {!author.isStaff && (
            <Badge variant="subtle" className="text-[10px]">
              Member
            </Badge>
          )}
        </div>

        {/* Bio */}
        {author.bio && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{author.bio}</p>
        )}

        {/* Article count */}
        <p className="text-xs text-muted-foreground mt-2">
          {articleCount} article{articleCount === 1 ? "" : "s"}
        </p>

        {/* Action row */}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => setFollowing((prev) => !prev)}
            className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
              following
                ? "bg-foreground/10 text-foreground"
                : "bg-foreground text-background hover:bg-foreground/90"
            }`}
          >
            {following ? (
              <>
                <Check className="h-4 w-4" />
                Following
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Follow
              </>
            )}
          </button>

          <button
            type="button"
            className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            title="Message"
          >
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            type="button"
            className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
