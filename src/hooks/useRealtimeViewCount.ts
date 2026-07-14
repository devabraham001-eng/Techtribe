"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface ViewCountState {
  count: number;
  isLive: boolean;
  lastUpdated: Date | null;
}

export function useRealtimeViewCount(slug: string, initialCount: number = 0) {
  const [state, setState] = useState<ViewCountState>({
    count: initialCount,
    isLive: false,
    lastUpdated: null,
  });

  const fetchLiveCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/view?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setState((current) => ({
          count: data.viewCount,
          isLive: current.isLive,
          lastUpdated: new Date(),
        }));
      }
    } catch {
      // Silent fail - keep current count
    }
  }, [slug]);

  const incrementView = useCallback(async () => {
    try {
      const res = await fetch("/api/posts/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        const data = await res.json();
        setState((current) => ({
          count: data.viewCount,
          isLive: current.isLive,
          lastUpdated: new Date(),
        }));
      }
    } catch {
      // Silent fail
    }
  }, [slug]);

  useEffect(() => {
    const timeout = setTimeout(fetchLiveCount, 0);

    if (!isSupabaseConfigured()) {
      return () => clearTimeout(timeout);
    }

    const supabase = createClient();
    let active = true;
    const channel = supabase
      .channel(`post-view-count-${slug}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "posts",
          filter: `slug=eq.${slug}`,
        },
        (payload) => {
          if (!active) return;
          const nextCount = payload.new.view_count;
          if (typeof nextCount !== "number") return;
          setState({
            count: nextCount,
            isLive: true,
            lastUpdated: new Date(),
          });
        }
      )
      .subscribe((status) => {
        if (!active) return;
        if (status === "SUBSCRIBED") {
          setState((current) => ({ ...current, isLive: true }));
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setState((current) => ({ ...current, isLive: false }));
        }
      });

    return () => {
      active = false;
      clearTimeout(timeout);
      void supabase.removeChannel(channel);
    };
  }, [fetchLiveCount, slug]);

  useEffect(() => {
    const timeout = setTimeout(incrementView, 0);
    return () => clearTimeout(timeout);
  }, [incrementView]);

  return {
    viewCount: state.count,
    isLive: state.isLive,
    lastUpdated: state.lastUpdated,
    refresh: fetchLiveCount,
  };
}
