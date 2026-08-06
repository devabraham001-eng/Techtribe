"use client";

import * as React from "react";
import { ThumbsUp, MessageCircle, Share2, Check } from "lucide-react";

interface PostActionsProps {
  slug: string;
}

export function PostActions({ slug }: PostActionsProps) {
  const [likes, setLikes] = React.useState(0);
  const [liked, setLiked] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [toggling, setToggling] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const fetchLikes = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${slug}/reactions`);
      if (res.ok) {
        const data = await res.json();
        setLikes(typeof data.likes === "number" ? data.likes : 0);
        setLiked(data.userReaction === "like");
      }
    } catch {
      // Ignore - keep defaults
    }
    setLoading(false);
  }, [slug]);

  React.useEffect(() => {
    const timeout = setTimeout(() => void fetchLikes(), 0);
    return () => clearTimeout(timeout);
  }, [fetchLikes]);

  async function handleLike() {
    if (toggling) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/posts/${slug}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction: "like" }),
      });
      if (res.ok) {
        const data = await res.json();
        const nowLiked = data.toggled === true;
        setLiked(nowLiked);
        setLikes((current) => Math.max(0, current + (nowLiked ? 1 : -1)));
      } else if (res.status === 401) {
        window.location.href = `/login?next=/blog/${slug}`;
      }
    } catch {
      // Ignore
    }
    setToggling(false);
  }

  function handleComment() {
    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      (document.getElementById("comment-input") as HTMLInputElement | null)?.focus();
    }, 400);
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = typeof document !== "undefined" ? document.title : "";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      <button
        type="button"
        disabled={loading || toggling}
        onClick={() => void handleLike()}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
          liked
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
        }`}
      >
        <ThumbsUp className={`h-3.5 w-3.5 ${liked ? "fill-primary/30" : ""}`} />
        <span>{liked ? "Liked" : "Like"}</span>
        {likes > 0 && <span className="ml-0.5 tabular-nums">{likes}</span>}
      </button>

      <button
        type="button"
        onClick={handleComment}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span>Comment</span>
      </button>

      <button
        type="button"
        onClick={() => void handleShare()}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </>
        )}
      </button>
    </div>
  );
}
