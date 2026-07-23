"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const chartConfig = {
  views: {
    label: "Page Views",
  },
  count: {
    label: "Views",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

export default function AnalyticsDashboard() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pruning, setPruning] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState("30d");

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

  const referenceDate = data.dailyViews.length > 0
    ? new Date(data.dailyViews[data.dailyViews.length - 1].date + "T00:00:00")
    : new Date();

  let daysToSubtract = 30;
  if (timeRange === "7d") daysToSubtract = 7;
  else if (timeRange === "90d") daysToSubtract = 90;

  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - daysToSubtract);

  const filteredData = data.dailyViews.filter((item) => {
    const date = new Date(item.date + "T00:00:00");
    return date >= startDate;
  });

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

      <Reveal direction="up" duration={0.4} delay={0.1}>
        <Card className="pt-0">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b border-border py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>Page Views Over Time</CardTitle>
              <CardDescription>
                Showing total page views for the selected period
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                aria-label="Select a time range"
              >
                <SelectValue placeholder="Last 30 days" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
                <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
                <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value: string) => {
                    const date = new Date(value + "T00:00:00");
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value: unknown) => {
                        if (typeof value !== "string") return value;
                        const date = new Date(value + "T00:00:00");
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="count"
                  type="natural"
                  fill="url(#fillViews)"
                  stroke="var(--color-count)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Reveal direction="up" duration={0.4} delay={0.15}>
          <Card className="pt-0 lg:col-span-2">
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Top Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Path</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPages.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                          No page views yet.
                        </td>
                      </tr>
                    )}
                    {data.topPages.map((page, idx) => (
                      <tr key={page.path} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-2.5 text-muted-foreground w-8">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-mono text-xs truncate max-w-[400px]">{page.path}</td>
                        <td className="px-4 py-2.5 text-right font-medium">{page.count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal direction="up" duration={0.4} delay={0.2}>
          <Card className="pt-0">
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Auth vs Anonymous
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-48">
                <ChartContainer
                  config={{
                    authenticated: { label: "Authenticated", color: COLORS[0] },
                    anonymous: { label: "Anonymous", color: COLORS[4] },
                  }}
                  className="h-full w-full"
                >
                  <BarChart data={authAnonData} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} width={100} axisLine={false} tickLine={false} />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {authAnonData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                  Authenticated: {authPct}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[4] }} />
                  Anonymous: {anonPct}%
                </span>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>

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
