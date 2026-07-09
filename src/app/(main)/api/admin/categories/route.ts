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

  const { data: authorRows } = await supabase.from("authors").select("is_staff").eq("user_id", user.id).single();
  const author = authorRows as unknown as { is_staff: boolean } | null;
  if (!author?.is_staff) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data: authorRows } = await supabase.from("authors").select("is_staff").eq("user_id", user.id).single();
  const author = authorRows as unknown as { is_staff: boolean } | null;
  if (!author?.is_staff) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!name || !slug) {
    return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, slug, description: body.description || null, icon: body.icon || null, color: body.color || null } as never)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
