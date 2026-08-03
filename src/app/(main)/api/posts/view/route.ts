import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBlogViewCount, incrementBlogViewCount } from "@/lib/blog-data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { slug } = await request.json();
  if (typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || request.headers.get("cf-connecting-ip")
    || null;

  const userAgent = request.headers.get("user-agent") || null;
  const referer = request.headers.get("referer") || null;

  const { data: postData } = await supabase
    .from("posts")
    .select("id, author_id")
    .eq("slug", slug)
    .single();
  const foundPost = postData as { id: string; author_id: string } | null;

  let isAuthor = false;
  if (foundPost && user) {
    const { data: authorData } = await supabase
      .from("authors")
      .select("id")
      .eq("user_id", user.id)
      .eq("id", foundPost.author_id)
      .single();
    isAuthor = !!authorData;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let alreadyViewedToday = false;
  if (foundPost && !isAuthor) {
    let query = supabase
      .from("post_views")
      .select("id", { count: "exact", head: true })
      .eq("post_id", foundPost.id)
      .gte("viewed_at", todayStart.toISOString());
    if (ip) {
      query = query.eq("viewer_ip", ip);
    } else if (user?.id) {
      query = query.eq("viewer_id", user.id);
    }
    const { count } = await query;
    alreadyViewedToday = (count ?? 0) > 0;
  }

  if (foundPost && !isAuthor && !alreadyViewedToday) {
    try {
      await supabase.from("post_views").insert({
        post_id: foundPost.id,
        viewer_ip: ip,
        user_agent: userAgent,
        referer,
        viewer_id: user?.id ?? null,
      } as never);
    } catch { /* best-effort */ }
  }

  let viewCount: number | null;
  if (isAuthor || alreadyViewedToday) {
    viewCount = await getBlogViewCount(slug);
  } else {
    viewCount = await incrementBlogViewCount(slug);
  }
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
