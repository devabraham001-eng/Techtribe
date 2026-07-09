import { NextResponse } from "next/server";
import { getPaginatedBlogPosts } from "@/lib/blog-data";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const limit = Number.parseInt(searchParams.get("limit") || "9", 10);
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const author = searchParams.get("author");
  const featured = searchParams.get("featured") === "true";
  const { posts, pagination } = await getPaginatedBlogPosts({
    page,
    limit,
    category,
    tag,
    author,
    featured,
  });

  return NextResponse.json({
    posts,
    pagination,
    meta: {
      generatedAt: new Date().toISOString(),
      cache: "public, max-age=30",
    },
  });
}
