"use client";

import * as React from "react";
import { Loader2, AlertCircle, Trash2 } from "lucide-react";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";

interface DailyView {
  date: string;
  authenticated: number;
  anonymous: number;
}

interface TopPage {
  path: string;
  count: number;
}

interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  monthViews: number;
  totalUnique: number;
  todayUnique: number;
  authCount: number;
  anonCount: number;
  dailyViews: DailyView[];
  topPages: TopPage[];
}

export default function AnalyticsClient() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pruning, setPruning] = React.useState(false);

  async function loadAnalytics() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to load analytics");
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const timer = window.setTimeout(() => void loadAnalytics(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleExport(format: "csv" | "json") {
    try {
      const res = await fetch(`/api/admin/analytics/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics_export_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed");
    }
  }

  async function handlePrune() {
    if (!confirm("Delete all page view data older than 6 months? This cannot be undone.")) return;
    setPruning(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics/prune", { method: "POST" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Prune failed");
      }
      void loadAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prune failed");
    } finally {
      setPruning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 lg:px-6">
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          <button type="button" onClick={() => void loadAnalytics()} className="ml-auto text-sm underline hover:no-underline">Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <SectionCards
        totalViews={data.totalViews}
        todayViews={data.todayViews}
        monthViews={data.monthViews}
        totalUnique={data.totalUnique}
        todayUnique={data.todayUnique}
        onExport={handleExport}
      />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive data={data.dailyViews} />
      </div>
      <div className="px-4 lg:px-6">
        <DataTable data={data.topPages} />
      </div>
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <div>
            <p className="text-sm font-medium">Data Retention</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Auto-prune removes data older than 6 months.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handlePrune()}
            disabled={pruning}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            {pruning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Prune Old Data
          </button>
        </div>
      </div>
    </>
  );
}
