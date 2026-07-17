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

  const { data: rawCollabs } = await supabase
    .from("post_collaborators")
    .select("id, author_id")
    .eq("post_id", postId);

  const collaborators = (rawCollabs ?? []) as { id: string; author_id: string }[];
  const authorIds = [...new Set(collaborators.map((c) => c.author_id))];
  const { data: rawAuthorRows } = await supabase
    .from("authors")
    .select("id, name, slug, avatar_url")
    .in("id", authorIds);

  const authorRows = (rawAuthorRows ?? []) as { id: string; name: string; slug: string; avatar_url: string | null }[];
  const authorById = new Map(authorRows.map((a) => [a.id, a]));

  const enriched = collaborators.map((c) => ({
    id: c.id,
    author: (() => {
      const a = authorById.get(c.author_id);
      return a ? { id: a.id, name: a.name, slug: a.slug, avatarUrl: a.avatar_url } : undefined;
    })(),
  }));

  return NextResponse.json(collaborators ?? []);
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

  const { data: author } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!author) {
    return NextResponse.json({ error: "Author profile not found" }, { status: 403 });
  }

  const authorData = author as { id: string };

  const { data: post } = await supabase
    .from("posts")
    .select("id, author_id")
    .eq("slug", slug)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const postData = post as { id: string; author_id: string };

  if (postData.author_id !== authorData.id) {
    return NextResponse.json({ error: "Only the post author can add collaborators" }, { status: 403 });
  }

  const body = await request.json() as { authorId?: string };
  if (!body.authorId) {
    return NextResponse.json({ error: "authorId is required" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("post_collaborators")
    .select("id")
    .eq("post_id", postData.id)
    .eq("author_id", body.authorId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Already a collaborator" }, { status: 409 });
  }

  const { data: collab, error } = await supabase
    .from("post_collaborators")
    .insert({ post_id: postData.id, author_id: body.authorId } as never)
    .select("id, author_id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const collabData = collab as { id: string; author_id: string };
  const { data: authorRow } = await supabase
    .from("authors")
    .select("id, name, slug, avatar_url")
    .eq("id", collabData.author_id)
    .single();

  const collabAuthor = authorRow as { id: string; name: string; slug: string; avatar_url: string | null } | null;

  return NextResponse.json({
    id: collabData.id,
    author: collabAuthor
      ? { id: collabAuthor.id, name: collabAuthor.name, slug: collabAuthor.slug, avatarUrl: collabAuthor.avatar_url }
      : undefined,
  }, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const url = new URL(request.url);
  const authorId = url.searchParams.get("authorId");

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data: author } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!author) {
    return NextResponse.json({ error: "Author profile not found" }, { status: 403 });
  }

  const authorData = author as { id: string };

  const { data: post } = await supabase
    .from("posts")
    .select("id, author_id")
    .eq("slug", slug)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const postData = post as { id: string; author_id: string };

  if (postData.author_id !== authorData.id) {
    return NextResponse.json({ error: "Only the post author can remove collaborators" }, { status: 403 });
  }

  if (!authorId) {
    return NextResponse.json({ error: "authorId query param is required" }, { status: 400 });
  }

  await supabase
    .from("post_collaborators")
    .delete()
    .eq("post_id", postData.id)
    .eq("author_id", authorId);

  return NextResponse.json({ deleted: true });
}
