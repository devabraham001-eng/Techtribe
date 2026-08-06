import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface PostCounts {
  likes: number;
  commentCount: number;
  shareCount: number;
}

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({});
  }

  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");
  if (!ids) return NextResponse.json({});

  const postIds = ids
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 100);
  if (postIds.length === 0) return NextResponse.json({});

  const supabase = await createServerSupabaseClient();

  const [reactionsRes, commentsRes] = await Promise.all([
    supabase.from("post_reactions").select("post_id, reaction").in("post_id", postIds),
    supabase.from("post_comments").select("post_id").in("post_id", postIds),
  ]);

  const counts: Record<string, PostCounts> = {};
  for (const id of postIds) {
    counts[id] = { likes: 0, commentCount: 0, shareCount: 0 };
  }

  for (const reaction of (reactionsRes.data ?? []) as { post_id: string; reaction: string }[]) {
    if (reaction.reaction === "like") counts[reaction.post_id].likes += 1;
    else if (reaction.reaction === "share") counts[reaction.post_id].shareCount += 1;
  }

  for (const comment of (commentsRes.data ?? []) as { post_id: string }[]) {
    counts[comment.post_id].commentCount += 1;
  }

  return NextResponse.json(counts);
}
