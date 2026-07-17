import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const exclude = url.searchParams.get("exclude") ?? "";

  const supabase = await createServerSupabaseClient();
  const { data: raw } = await supabase
    .from("authors")
    .select("id, name, slug, avatar_url")
    .order("name");

  const authors = (raw ?? []) as { id: string; name: string; slug: string; avatar_url: string | null }[];
  let filtered = authors;
  if (q) {
    filtered = authors.filter(
      (a) => a.name.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q)
    );
  }
  if (exclude) {
    filtered = filtered.filter((a) => a.id !== exclude);
  }

  return NextResponse.json(filtered.slice(0, 10));
}
