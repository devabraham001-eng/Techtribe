import { NextResponse } from "next/server";
import { DEMO_POSTS } from "@/lib/demo-data";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "9");
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const author = searchParams.get("author");
  const featured = searchParams.get("featured") === "true";

  let posts = [...DEMO_POSTS];

  if (category) posts = posts.filter((p) => p.category?.slug === category);
  if (tag) posts = posts.filter((p) => p.tags?.some((t) => t.slug === tag));
  if (author) posts = posts.filter((p) => p.author.slug === author);
  if (featured) posts = posts.filter((_, i) => i === 0);

  const total = posts.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedPosts = posts.slice(offset, offset + limit);

  return NextResponse.json({
    posts: paginatedPosts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
    meta: {
      generatedAt: new Date().toISOString(),
      cache: "public, max-age=30",
    },
  });
}