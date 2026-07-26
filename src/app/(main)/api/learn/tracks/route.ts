import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
  }

  const supabase = await createServerSupabaseClient();
  const { data: tracks } = await supabase
    .from("learning_tracks")
    .select("*")
    .order("title");

  return NextResponse.json(tracks ?? []);
}
