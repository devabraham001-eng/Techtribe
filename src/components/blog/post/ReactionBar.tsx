"use client";

import * as React from "react";
import { Rocket, Brain, GraduationCap } from "lucide-react";

interface ReactionCounts {
  ship_it: number;
  mind_blown: number;
  learned_something: number;
  userReaction: string | null;
}

const REACTIONS = [
  { key: "ship_it", label: "Ship It", icon: Rocket },
  { key: "mind_blown", label: "Mind Blown", icon: Brain },
  { key: "learned_something", label: "Learned Something", icon: GraduationCap },
];

interface ReactionBarProps {
  slug: string;
}

export function ReactionBar({ slug }: ReactionBarProps) {
  const [counts, setCounts] = React.useState<ReactionCounts | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [toggling, setToggling] = React.useState<string | null>(null);

  async function fetchReactions() {
    try {
      const res = await fetch(`/api/posts/${slug}/reactions`);
      if (res.ok) {
        setCounts(await res.json());
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  React.useEffect(() => { fetchReactions(); }, [slug]);

  async function handleReaction(key: string) {
    setToggling(key);
    try {
      const res = await fetch(`/api/posts/${slug}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction: key }),
      });
      if (res.ok) {
        await fetchReactions();
      } else if (res.status === 401) {
        window.location.href = `/login?next=/blog/${slug}`;
      }
    } catch { /* ignore */ }
    setToggling(null);
  }

  if (loading) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      {REACTIONS.map(({ key, label, icon: Icon }) => {
        const count = counts ? counts[key as keyof ReactionCounts] as number : 0;
        const isActive = counts?.userReaction === key;
        return (
          <button
            key={key}
            type="button"
            disabled={toggling === key}
            onClick={() => handleReaction(key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            } disabled:opacity-50`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
            {count > 0 && (
              <span className={`ml-0.5 tabular-nums ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
