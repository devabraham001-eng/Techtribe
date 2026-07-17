import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
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

  const { data: rawAnnotations } = await supabase
    .from("post_annotations")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const annotations = (rawAnnotations ?? []) as {
    id: string; post_id: string; user_id: string; quote: string; comment: string;
    start_offset: number; end_offset: number; created_at: string; updated_at: string;
  }[];

  const userIds = [...new Set(annotations.map((a) => a.user_id))];
  const { data: rawAuthors } = await supabase
    .from("authors")
    .select("id, name, slug, avatar_url, user_id")
    .in("user_id", userIds);

  const authors = (rawAuthors ?? []) as { id: string; name: string; slug: string; avatar_url: string | null; user_id: string }[];
  const authorByUserId = new Map(authors.map((a) => [a.user_id, a]));

  const enriched = annotations.map((a) => ({
    id: a.id,
    postId: a.post_id,
    userId: a.user_id,
    quote: a.quote,
    comment: a.comment,
    startOffset: a.start_offset,
    endOffset: a.end_offset,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
    author: (() => {
      const author = authorByUserId.get(a.user_id);
      return author ? { id: author.id, name: author.name, slug: author.slug, avatarUrl: author.avatar_url } : undefined;
    })(),
  }));

  return NextResponse.json(enriched);
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

  const pId = (post as { id: string }).id;

  const body = await request.json() as {
    quote?: string;
    comment?: string;
    startOffset?: number;
    endOffset?: number;
  };

  if (!body.quote || !body.comment || body.startOffset == null || body.endOffset == null) {
    return NextResponse.json({ error: "quote, comment, startOffset, and endOffset are required" }, { status: 400 });
  }

  const { data: annotation, error } = await supabase
    .from("post_annotations")
    .insert({
      post_id: pId,
      user_id: user.id,
      quote: body.quote,
      comment: body.comment,
      start_offset: body.startOffset,
      end_offset: body.endOffset,
    } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(annotation, { status: 201 });
}
