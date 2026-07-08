import { NextResponse } from "next/server";
import { DEMO_POSTS } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() || "";

  await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));

  if (!q) {
    return NextResponse.json({ posts: [], query: q });
  }

  const results = DEMO_POSTS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt?.toLowerCase().includes(q) ||
      p.author.name.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.name.toLowerCase().includes(q)) ||
      p.category?.name.toLowerCase().includes(q)
  );

  return NextResponse.json({
    posts: results,
    query: q,
    total: results.length,
    took: `${(Math.random() * 200 + 100).toFixed(0)}ms`,
  });
}