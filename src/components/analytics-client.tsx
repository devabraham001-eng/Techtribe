"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [clearing, setClearing] = React.useState(false);
  const [clearCutoff, setClearCutoff] = React.useState("");
  const [clearMessage, setClearMessage] = React.useState<string | null>(null);

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

  async function handleClear() {
    const label = clearCutoff
      ? `Delete all site analytics created before ${clearCutoff}? This cannot be undone.`
      : "Delete ALL site analytics data? This cannot be undone.";
    if (!confirm(label)) return;
    setClearing(true);
    setError(null);
    setClearMessage(null);
    try {
      const res = await fetch("/api/admin/analytics/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clearCutoff ? { before: clearCutoff } : {}),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Clear failed");
      }
      const data = await res.json();
      setClearMessage(`Deleted ${(data.deletedCount ?? 0).toLocaleString()} records.`);
      void loadAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clear failed");
    } finally {
      setClearing(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border p-5 space-y-3">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-8 w-24 rounded" />
              <Skeleton className="h-2 w-full rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border p-6 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <div className="space-y-2">
            <div className="flex items-end gap-2" style={{ height: 72 }}>
              <Skeleton className="flex-1 rounded-t" style={{ height: "100%" }} />
              <Skeleton className="flex-1 rounded-t" style={{ height: "65%" }} />
              <Skeleton className="flex-1 rounded-t" style={{ height: "85%" }} />
            </div>
            <div className="flex items-end gap-2" style={{ height: 64 }}>
              <Skeleton className="flex-1 rounded-t" style={{ height: "75%" }} />
              <Skeleton className="flex-1 rounded-t" style={{ height: "90%" }} />
              <Skeleton className="flex-1 rounded-t" style={{ height: "55%" }} />
            </div>
            <div className="flex items-end gap-2" style={{ height: 56 }}>
              <Skeleton className="flex-1 rounded-t" style={{ height: "80%" }} />
              <Skeleton className="flex-1 rounded-t" style={{ height: "60%" }} />
              <Skeleton className="flex-1 rounded-t" style={{ height: "70%" }} />
            </div>
          </div>
        </div>
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
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
          <div>
            <p className="text-sm font-medium">Clear Analytics Data</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {clearCutoff
                ? `Deletes site analytics created before ${clearCutoff}.`
                : "Deletes all site analytics data. Optionally set a date to keep recent data."}
            </p>
            <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              Delete data before
              <input
                type="date"
                value={clearCutoff}
                onChange={(e) => setClearCutoff(e.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
              />
            </label>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => void handleClear()}
              disabled={clearing}
              className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              {clearing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Clear Data
            </button>
            {clearMessage && (
              <span className="text-xs text-muted-foreground">{clearMessage}</span>
            )}
          </div>
        </div>
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
