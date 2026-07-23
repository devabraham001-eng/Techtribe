"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

interface DailyView {
  date: string;
  authenticated: number;
  anonymous: number;
}

interface ChartAreaInteractiveProps {
  data: DailyView[];
}

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  authenticated: {
    label: "Authenticated",
    color: "var(--chart-1)",
  },
  anonymous: {
    label: "Anonymous",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState("30d");

  const referenceDate = data.length > 0
    ? new Date(data[data.length - 1].date + "T00:00:00")
    : new Date();

  let daysToSubtract = 30;
  if (timeRange === "7d") daysToSubtract = 7;
  else if (timeRange === "90d") daysToSubtract = 90;

  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - daysToSubtract);

  const filteredData = data.filter((item) => {
    const date = new Date(item.date + "T00:00:00");
    return date >= startDate;
  });

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Page Views Over Time</CardTitle>
          <CardDescription>
            Showing daily page views split by authenticated vs anonymous visitors
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
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
              <linearGradient id="fillAuthenticated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-authenticated)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-authenticated)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillAnonymous" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-anonymous)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-anonymous)" stopOpacity={0.1} />
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
              dataKey="anonymous"
              type="natural"
              fill="url(#fillAnonymous)"
              stroke="var(--color-anonymous)"
              stackId="a"
            />
            <Area
              dataKey="authenticated"
              type="natural"
              fill="url(#fillAuthenticated)"
              stroke="var(--color-authenticated)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
