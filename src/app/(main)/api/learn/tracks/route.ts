import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
  }

  const supabase = await createServerSupabaseClient();

  const { data: tracks } = await supabase.from("learning_tracks").select("*").order("title");
  const { data: modules } = await supabase.from("track_modules").select("id, track_id");
  const { data: lessons } = await supabase.from("lessons").select("id, module_id");

  const moduleCountByTrack = new Map<string, number>();
  for (const mod of modules ?? []) {
    const m = mod as { id: string; track_id: string };
    moduleCountByTrack.set(m.track_id, (moduleCountByTrack.get(m.track_id) ?? 0) + 1);
  }

  const trackByModule = new Map<string, string>();
  for (const mod of modules ?? []) {
    const m = mod as { id: string; track_id: string };
    trackByModule.set(m.id, m.track_id);
  }

  const lessonCountByTrack = new Map<string, number>();
  for (const lesson of lessons ?? []) {
    const l = lesson as { module_id: string };
    const trackId = trackByModule.get(l.module_id);
    if (trackId) {
      lessonCountByTrack.set(trackId, (lessonCountByTrack.get(trackId) ?? 0) + 1);
    }
  }

  const result = (tracks ?? []).map((track) => {
    const t = track as Record<string, unknown>;
    return {
      ...t,
      module_count: moduleCountByTrack.get(t.id as string) ?? 0,
    };
  });

  return NextResponse.json(result);
}
