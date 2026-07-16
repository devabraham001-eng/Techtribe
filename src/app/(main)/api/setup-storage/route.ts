import { NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const BUCKETS = [
  { id: "post-covers", name: "post-covers" },
  { id: "avatars", name: "avatars" },
] as const;

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: authorData } = await supabase.from("authors").select("is_staff").eq("user_id", user.id).single();
  const author = authorData as { is_staff: boolean } | null;
  if (!author?.is_staff) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({
      error: "SUPABASE_SERVICE_ROLE_KEY not set. Add it to your environment variables.",
      hint: "Get it from Supabase Dashboard → Settings → API → service_role key, then add SUPABASE_SERVICE_ROLE_KEY to your .env.local or Vercel env vars.",
    }, { status: 400 });
  }

  const results: { bucket: string; created: boolean; error?: string }[] = [];

  for (const { id } of BUCKETS) {
    const { error: getError } = await admin.storage.getBucket(id);
    if (!getError) {
      results.push({ bucket: id, created: false, error: "already exists" });
      continue;
    }

    const { error: createError } = await admin.storage.createBucket(id, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });

    if (createError) {
      results.push({ bucket: id, created: false, error: createError.message });
    } else {
      results.push({ bucket: id, created: true });
    }
  }

  const allCreated = results.every((r) => r.created);
  return NextResponse.json({
    success: allCreated,
    results,
  });
}
