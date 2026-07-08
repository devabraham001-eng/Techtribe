import { NextResponse } from "next/server";
import { DEMO_POSTS } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { slug } = await request.json();
  const post = DEMO_POSTS.find((p) => p.slug === slug);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  post.viewCount += 1 + Math.floor(Math.random() * 3);

  return NextResponse.json({
    slug: post.slug,
    viewCount: post.viewCount,
    updatedAt: new Date().toISOString(),
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const post = DEMO_POSTS.find((p) => p.slug === slug);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const liveViewCount = post.viewCount + Math.floor(Math.random() * 5);

  return NextResponse.json({
    slug: post.slug,
    viewCount: liveViewCount,
    isLive: true,
  });
}