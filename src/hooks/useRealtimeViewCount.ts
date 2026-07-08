"use client";

import { useState, useEffect, useCallback } from "react";

interface ViewCountState {
  count: number;
  isLive: boolean;
  lastUpdated: Date | null;
}

export function useRealtimeViewCount(slug: string, initialCount: number = 0) {
  const [state, setState] = useState<ViewCountState>({
    count: initialCount,
    isLive: true,
    lastUpdated: null,
  });

  const fetchLiveCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/view?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setState({
          count: data.viewCount,
          isLive: data.isLive,
          lastUpdated: new Date(),
        });
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
        setState((prev) => ({
          count: data.viewCount,
          isLive: true,
          lastUpdated: new Date(),
        }));
      }
    } catch {
      // Silent fail
    }
  }, [slug]);

  useEffect(() => {
    const interval = setInterval(fetchLiveCount, 30000);
    fetchLiveCount();
    return () => clearInterval(interval);
  }, [fetchLiveCount]);

  useEffect(() => {
    incrementView();
  }, [incrementView]);

  return {
    viewCount: state.count,
    isLive: state.isLive,
    lastUpdated: state.lastUpdated,
    refresh: fetchLiveCount,
  };
}