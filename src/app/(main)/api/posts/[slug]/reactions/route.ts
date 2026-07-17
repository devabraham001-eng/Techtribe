import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ship_it: 0, mind_blown: 0, learned_something: 0 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: post } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const postId = (post as { id: string }).id;

  const { data: rawReactions } = await supabase
    .from("post_reactions")
    .select("reaction")
    .eq("post_id", postId);

  const reactions = (rawReactions ?? []) as { reaction: string }[];

  const counts = { ship_it: 0, mind_blown: 0, learned_something: 0 };
  if (reactions) {
    for (const r of reactions) {
      if (r.reaction in counts) counts[r.reaction as keyof typeof counts]++;
    }
  }

  const { data: { user } } = await supabase.auth.getUser();
  let userReaction: string | null = null;
  if (user) {
    const { data: myReaction } = await supabase
      .from("post_reactions")
      .select("reaction")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();
    userReaction = (myReaction as { reaction: string } | null)?.reaction ?? null;
  }

  return NextResponse.json({ ...counts, userReaction });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data: post } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const postId = (post as { id: string }).id;

  const body = await request.json() as { reaction?: string };
  const reaction = body.reaction;
  if (!reaction || !["ship_it", "mind_blown", "learned_something"].includes(reaction)) {
    return NextResponse.json({ error: "Invalid reaction" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("post_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("reaction", reaction)
    .maybeSingle();

  if (existing) {
    const existingId = (existing as { id: string }).id;
    await supabase
      .from("post_reactions")
      .delete()
      .eq("id", existingId);
    return NextResponse.json({ toggled: false, reaction });
  }

  await supabase
    .from("post_reactions")
    .insert({ post_id: postId, user_id: user.id, reaction } as never);

  return NextResponse.json({ toggled: true, reaction });
}
