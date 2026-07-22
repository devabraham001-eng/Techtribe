"use client";

import * as React from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { PostAnnotation } from "@/types/blog";

interface AnnotationLayerProps {
  slug: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export function AnnotationLayer({ slug, contentRef }: AnnotationLayerProps) {
  const [annotations, setAnnotations] = React.useState<PostAnnotation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showPopup, setShowPopup] = React.useState(false);
  const [popupPos, setPopupPos] = React.useState({ x: 0, y: 0 });
  const [selection, setSelection] = React.useState<{ text: string; start: number; end: number } | null>(null);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const popupRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetch(`/api/posts/${slug}/annotations`)
      .then((r) => r.json())
      .then((data) => setAnnotations(Array.isArray(data) ? data : []))
      .catch(() => setAnnotations([]))
      .finally(() => setLoading(false));
  }, [slug]);

  React.useEffect(() => {
    if (!showPopup) return;
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPopup]);

  function getTextOffset(node: Node, targetOffset: number): number {
    let offset = 0;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let textNode: Text | null;
    while ((textNode = walker.nextNode() as Text | null)) {
      const len = textNode.textContent?.length ?? 0;
      if (targetOffset < offset + len) {
        return offset;
      }
      offset += len;
    }
    return offset;
  }

  function handleMouseUp(e: React.MouseEvent) {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim() || !contentRef.current) {
      return;
    }
    const range = sel.getRangeAt(0);
    const startOffset = getTextOffset(contentRef.current, 0);
    const text = sel.toString().trim();

    setSelection({ text, start: startOffset, end: startOffset + text.length });
    setPopupPos({ x: e.clientX, y: e.clientY });
    setShowPopup(true);
    setComment("");
  }

  async function submitAnnotation() {
    if (!selection || !comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${slug}/annotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote: selection.text,
          comment: comment.trim(),
          startOffset: selection.start,
          endOffset: selection.end,
        }),
      });
      if (res.ok) {
        const annotation = await res.json();
        setAnnotations((prev) => [...prev, annotation]);
        setShowPopup(false);
        setSelection(null);
        setComment("");
        window.getSelection()?.removeAllRanges();
      } else if (res.status === 401) {
        window.location.href = `/login?next=/blog/${slug}`;
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  return (
    <>
      {showPopup && selection && (
        <div
          ref={popupRef}
          className="fixed z-50 w-80 rounded-xl border border-border bg-card shadow-xl p-4"
          style={{ left: popupPos.x, top: Math.max(popupPos.y - 10, 10) }}
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs font-medium text-foreground flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Comment on selection
            </span>
            <button type="button" onClick={() => setShowPopup(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-2 italic line-clamp-2 bg-muted p-2 rounded">
            &ldquo;{selection.text}&rdquo;
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Write a comment..."
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              disabled={!comment.trim() || submitting}
              onClick={submitAnnotation}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              Send
            </button>
          </div>
        </div>
      )}

      {annotations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            Annotations ({annotations.length})
          </h3>
          <div className="space-y-3">
            {annotations.map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-start gap-2">
                  <Avatar className="h-6 w-6 mt-0.5">
                    <AvatarImage src={a.author?.avatarUrl || ""} alt={a.author?.name || ""} />
                    <AvatarFallback className="text-[10px] font-bold text-primary bg-primary/20">
                      {getInitials(a.author?.name ?? "A")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">
                        {a.author?.name ?? "Anonymous"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground italic bg-muted p-2 rounded mb-1">
                      &ldquo;{a.quote}&rdquo;
                    </p>
                    <p className="text-xs text-foreground">{a.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
