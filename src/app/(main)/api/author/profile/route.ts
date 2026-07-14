import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data, error } = await supabase
    .from("authors")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data: authorRows } = await supabase.from("authors").select("id").eq("user_id", user.id).single();
  const author = authorRows as unknown as { id: string } | null;
  if (!author) return NextResponse.json({ error: "Author profile not found." }, { status: 403 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "Display name cannot be empty." }, { status: 400 });
    updates.name = name;
  }
  if (typeof body.bio === "string") updates.bio = body.bio.trim() || null;
  if (typeof body.avatar_url === "string") updates.avatar_url = body.avatar_url.trim() || null;
  if (typeof body.twitter === "string") updates.twitter = body.twitter.trim() || null;
  if (typeof body.github === "string") updates.github = body.github.trim() || null;
  if (typeof body.linkedin === "string") updates.linkedin = body.linkedin.trim() || null;
  if (typeof body.website === "string") updates.website = body.website.trim() || null;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("authors")
    .update(updates as never)
    .eq("id", author.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
