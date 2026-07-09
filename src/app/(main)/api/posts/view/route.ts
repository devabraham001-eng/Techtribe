import { NextResponse } from "next/server";
import { getBlogViewCount, incrementBlogViewCount } from "@/lib/blog-data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { slug } = await request.json();
  if (typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const viewCount = await incrementBlogViewCount(slug);
  if (viewCount === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    slug,
    viewCount,
    updatedAt: new Date().toISOString(),
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const viewCount = await getBlogViewCount(slug);
  if (viewCount === null) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    slug,
    viewCount,
    isLive: true,
  });
}
