"use client";

import * as React from "react";
import { CheckCircle2, Loader2, LogIn } from "lucide-react";

interface LessonCompleteButtonProps {
  lessonId: string;
  isProject: boolean;
  trackSlug: string;
}

export function LessonCompleteButton({ lessonId, isProject, trackSlug }: LessonCompleteButtonProps) {
  const [completed, setCompleted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    async function check() {
      try {
        const res = await fetch(`/api/learn/progress?lessonIds=${lessonId}`);
        if (res.status === 401) {
          setAuthenticated(false);
          setLoading(false);
          return;
        }
        setAuthenticated(true);
        const data = await res.json() as { lesson_id: string }[];
        setCompleted(data.some((p) => p.lesson_id === lessonId));
      } catch { /* ignore */ }
      setLoading(false);
    }
    check();
  }, [lessonId]);

  async function handleComplete() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/learn/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      if (res.ok) {
        setCompleted(true);
      } else if (res.status === 401) {
        window.location.href = `/login?redirect=/learn/${trackSlug}/${lessonId}`;
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex justify-center">
        <a
          href={`/login?redirect=/learn/${trackSlug}/${lessonId}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <LogIn className="h-4 w-4" />
          Sign in to track progress
        </a>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex items-center justify-center gap-2 text-[#00FC90]">
        <CheckCircle2 className="h-5 w-5" />
        <span className="text-sm font-medium">Completed</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        disabled={submitting}
        onClick={handleComplete}
        className="inline-flex items-center gap-2 rounded-lg bg-[#00FC90] px-6 py-3 text-sm font-medium text-black hover:bg-[#00FC90]/90 transition-colors disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        {isProject ? "Submit project" : "Mark as complete"}
      </button>
      {isProject && (
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Write a project breakdown article to submit. Your article will be published to the community feed.
        </p>
      )}
    </div>
  );
}
