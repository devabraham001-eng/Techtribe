import { NextResponse } from "next/server";
import { searchBlogPosts } from "@/lib/blog-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q) {
    return NextResponse.json({ posts: [], query: q });
  }

  const startedAt = performance.now();
  const results = await searchBlogPosts(q);

  return NextResponse.json({
    posts: results,
    query: q,
    total: results.length,
    took: `${Math.round(performance.now() - startedAt)}ms`,
  });
}
