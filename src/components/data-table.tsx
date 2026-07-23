"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TopPage {
  path: string;
  count: number;
}

interface DataTableProps {
  data: TopPage[];
}

export function DataTable({ data }: DataTableProps) {
  return (
    <Card className="pt-0">
      <CardHeader className="border-b py-5">
        <CardTitle>Top Pages</CardTitle>
        <CardDescription>
          Most visited pages across the site.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 lg:px-6 py-3 text-left font-medium text-muted-foreground w-12">#</th>
                <th className="px-4 lg:px-6 py-3 text-left font-medium text-muted-foreground">Path</th>
                <th className="px-4 lg:px-6 py-3 text-right font-medium text-muted-foreground">Views</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 lg:px-6 py-8 text-center text-muted-foreground">
                    No page views yet.
                  </td>
                </tr>
              )}
              {data.map((page, idx) => (
                <tr key={page.path} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 lg:px-6 py-3 text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 lg:px-6 py-3 font-mono text-xs truncate max-w-[500px]">{page.path}</td>
                  <td className="px-4 lg:px-6 py-3 text-right font-medium tabular-nums">{page.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
