import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/blog/write";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/blog/write";

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login?error=not-configured", url.origin));
  }

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=callback", url.origin));
}
