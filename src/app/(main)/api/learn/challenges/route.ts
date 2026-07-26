import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId query parameter is required" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("lesson_challenges")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order_index");

  return NextResponse.json(data ?? []);
}
