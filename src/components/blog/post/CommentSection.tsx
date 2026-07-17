"use client";

import * as React from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import type { PostComment } from "@/types/blog";

interface CommentSectionProps {
  slug: string;
}

function CommentThread({ comment, slug, onReply }: {
  comment: PostComment;
  slug: string;
  onReply: () => void;
}) {
  const [replying, setReplying] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function submitReply() {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText.trim(), parentId: comment.id }),
      });
      if (res.ok) {
        setReplyText("");
        setReplying(false);
        onReply();
      } else if (res.status === 401) {
        window.location.href = `/login?next=/blog/${slug}`;
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  return (
    <div className="pl-4 border-l-2 border-border">
      <div className="flex items-start gap-2 mb-2">
        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[10px] font-bold text-primary">
            {(comment.author?.name ?? "A").charAt(0)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">
              {comment.author?.name ?? "Anonymous"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-foreground mt-0.5">{comment.content}</p>
          <button
            type="button"
            onClick={() => setReplying(!replying)}
            className="text-xs text-muted-foreground hover:text-foreground mt-1"
          >
            Reply
          </button>
        </div>
      </div>

      {replying && (
        <div className="ml-9 mb-3 flex gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            disabled={!replyText.trim() || submitting}
            onClick={submitReply}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          </button>
        </div>
      )}

      {comment.replies?.map((reply) => (
        <CommentThread key={reply.id} comment={reply} slug={slug} onReply={onReply} />
      ))}
    </div>
  );
}

export function CommentSection({ slug }: CommentSectionProps) {
  const [comments, setComments] = React.useState<PostComment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newComment, setNewComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function loadComments() {
    try {
      const res = await fetch(`/api/posts/${slug}/comments`);
      if (res.ok) setComments(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }

  React.useEffect(() => { loadComments(); }, [slug]);

  async function submitComment() {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        setNewComment("");
        await loadComments();
      } else if (res.status === 401) {
        window.location.href = `/login?next=/blog/${slug}`;
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-1.5">
        <MessageCircle className="h-4 w-4" />
        Comments ({comments.length})
      </h3>

      <div className="flex gap-2 mb-6">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="button"
          disabled={!newComment.trim() || submitting}
          onClick={submitComment}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentThread key={comment.id} comment={comment} slug={slug} onReply={loadComments} />
          ))}
        </div>
      )}
    </div>
  );
}
