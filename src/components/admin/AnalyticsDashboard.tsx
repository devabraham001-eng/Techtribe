"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Eye,
  Users,
  TrendingUp,
  CalendarDays,
  Loader2,
  AlertCircle,
  Download,
  Trash2,
} from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

interface DailyView {
  date: string;
  count: number;
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

const COLORS = ["#00FC90", "#3b82f6", "#a78bfa", "#f59e0b", "#ef4444", "#ec4899"];

export default function AnalyticsDashboard() {
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
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        {error}
        <button type="button" onClick={() => void loadAnalytics()} className="ml-auto text-sm underline hover:no-underline">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const total = data.authCount + data.anonCount;
  const authPct = total > 0 ? Math.round((data.authCount / total) * 100) : 0;
  const anonPct = total > 0 ? Math.round((data.anonCount / total) * 100) : 0;

  const authAnonData = [
    { name: "Authenticated", value: data.authCount, color: COLORS[0] },
    { name: "Anonymous", value: data.anonCount, color: COLORS[4] },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Reveal direction="up" duration={0.35} delay={0}>
          <StatCard icon={<Eye className="h-5 w-5" />} label="Total Views" value={data.totalViews.toLocaleString()} accent={COLORS[0]} />
        </Reveal>
        <Reveal direction="up" duration={0.35} delay={0.05}>
          <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Today Views" value={data.todayViews.toLocaleString()} accent={COLORS[1]} />
        </Reveal>
        <Reveal direction="up" duration={0.35} delay={0.1}>
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="This Month" value={data.monthViews.toLocaleString()} accent={COLORS[2]} />
        </Reveal>
        <Reveal direction="up" duration={0.35} delay={0.15}>
          <StatCard icon={<Users className="h-5 w-5" />} label="Unique Visitors" value={data.totalUnique.toLocaleString()} accent={COLORS[3]} />
        </Reveal>
        <Reveal direction="up" duration={0.35} delay={0.2}>
          <StatCard icon={<Users className="h-5 w-5" />} label="Unique Today" value={data.todayUnique.toLocaleString()} accent={COLORS[4]} />
        </Reveal>
        <Reveal direction="up" duration={0.35} delay={0.25}>
          <StatCard icon={<Download className="h-5 w-5" />} label="Export" value="" accent={COLORS[5]}>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => void handleExport("csv")}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => void handleExport("json")}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                JSON
              </button>
            </div>
          </StatCard>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Reveal direction="up" duration={0.4} delay={0.1}>
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-4">
              Views (Last 30 Days)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(val: string) => {
                      const d = new Date(val + "T00:00:00");
                      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    labelFormatter={(val) => {
                      if (typeof val !== "string") return val;
                      const d = new Date(val + "T00:00:00");
                      return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={COLORS[0]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: COLORS[0] }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>

        <Reveal direction="up" duration={0.4} delay={0.15}>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-4">
              Auth vs Anonymous
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={authAnonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {authAnonData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                Authenticated: {authPct}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[4] }} />
                Anonymous: {anonPct}%
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal direction="up" duration={0.4} delay={0.2}>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-4">
            Top Pages
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-medium text-muted-foreground">#</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Path</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Views</th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.length === 0 && (
                  <tr>
                    <td colSpan={3} className="pt-4 pb-8 text-center text-muted-foreground">
                      No page views yet.
                    </td>
                  </tr>
                )}
                {data.topPages.map((page, idx) => (
                  <tr key={page.path} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="py-2.5 pr-4 text-muted-foreground w-8">{idx + 1}</td>
                    <td className="py-2.5 font-mono text-xs truncate max-w-[400px]">{page.path}</td>
                    <td className="py-2.5 text-right font-medium">{page.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      <Reveal direction="up" duration={0.4} delay={0.25}>
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
      </Reveal>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.06] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
          transform: "translate(30%, -30%)",
        }}
      />
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
          {icon}
        </div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      {value && <p className="mt-2 font-heading text-xl font-bold" style={{ color: accent }}>{value}</p>}
      {children}
    </div>
  );
}
