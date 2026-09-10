import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/practice-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json([], { status: 200 });
  }
  const entries = await getLeaderboard(20);
  return NextResponse.json(entries);
}
