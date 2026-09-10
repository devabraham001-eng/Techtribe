import { NextRequest, NextResponse } from "next/server";
import { getWorkloads } from "@/lib/practice-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json([], { status: 200 });
  }
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const workloads = await getWorkloads(category);
  return NextResponse.json(workloads);
}
