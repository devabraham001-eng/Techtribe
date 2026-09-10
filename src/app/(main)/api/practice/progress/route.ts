import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ passedIds: [] }, { status: 200 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ passedIds: [] }, { status: 200 });
  }

  const { data } = await supabase
    .from("user_workload_submissions")
    .select("workload_id")
    .eq("user_id", user.id)
    .eq("passed", true);

  const passedIds = [...new Set((data ?? []).map((r: { workload_id: string }) => r.workload_id))];
  return NextResponse.json({ passedIds });
}
