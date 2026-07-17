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
  const { data: rawPost } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!rawPost) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  const postId = (rawPost as { id: string }).id;

  const { data: rawComments } = await supabase
    .from("post_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const comments = (rawComments ?? []) as {
    id: string; post_id: string; user_id: string; content: string;
    parent_id: string | null; created_at: string; updated_at: string;
  }[];

  const userIds = [...new Set(comments.map((c) => c.user_id))];
  const { data: rawAuthors } = await supabase
    .from("authors")
    .select("id, name, slug, avatar_url, user_id")
    .in("user_id", userIds);

  const authors = (rawAuthors ?? []) as { id: string; name: string; slug: string; avatar_url: string | null; user_id: string }[];
  const authorByUserId = new Map(authors.map((a) => [a.user_id, a]));

  const enriched = comments.map((c) => ({
    id: c.id,
    postId: c.post_id,
    userId: c.user_id,
    content: c.content,
    parentId: c.parent_id,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    author: (() => {
      const a = authorByUserId.get(c.user_id);
      return a ? { id: a.id, name: a.name, slug: a.slug, avatarUrl: a.avatar_url } : undefined;
    })(),
  }));

  const topLevel = enriched.filter((c) => !c.parentId);
  const repliesByParent = new Map<string, typeof enriched>();
  for (const c of enriched) {
    if (c.parentId) {
      const existing = repliesByParent.get(c.parentId) ?? [];
      existing.push(c);
      repliesByParent.set(c.parentId, existing);
    }
  }
  const tree = topLevel.map((c) => ({ ...c, replies: repliesByParent.get(c.id) ?? [] }));

  return NextResponse.json(tree);
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

  const { data: rawPost } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!rawPost) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  const postId = (rawPost as { id: string }).id;

  const body = await request.json() as { content?: string; parentId?: string | null };

  if (!body.content || !body.content.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const insertData: Record<string, unknown> = {
    post_id: postId,
    user_id: user.id,
    content: body.content.trim(),
  };
  if (body.parentId) {
    insertData.parent_id = body.parentId;
  }

  const { data: rawComment, error } = await supabase
    .from("post_comments")
    .insert(insertData as never)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const comment = rawComment as {
    id: string; post_id: string; user_id: string; content: string;
    parent_id: string | null; created_at: string; updated_at: string;
  };

  const { data: rawAuthor } = await supabase
    .from("authors")
    .select("id, name, slug, avatar_url")
    .eq("user_id", user.id)
    .single();

  const authorData = rawAuthor as { id: string; name: string; slug: string; avatar_url: string | null } | null;

  return NextResponse.json({
    id: comment.id,
    postId: comment.post_id,
    userId: comment.user_id,
    content: comment.content,
    parentId: comment.parent_id,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    author: authorData
      ? { id: authorData.id, name: authorData.name, slug: authorData.slug, avatarUrl: authorData.avatar_url }
      : undefined,
    replies: [],
  }, { status: 201 });
}
