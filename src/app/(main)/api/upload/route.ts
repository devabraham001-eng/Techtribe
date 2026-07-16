import { NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const bucket = formData.get("bucket") as string || "post-covers";
  const allowedBuckets = ["post-covers", "avatars"];

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!allowedBuckets.includes(bucket)) {
    return NextResponse.json({ error: "Invalid upload bucket." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: "Invalid file type. Allowed: jpg, png, webp, gif" }, { status: 400 });
  }

  if (file.type && !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Invalid file type. Upload an image file." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
  }

  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const storage = createAdminSupabaseClient()?.storage.from(bucket) ?? supabase.storage.from(bucket);

  const { data, error } = await storage.upload(path, buffer, {
    contentType: file.type || `image/${ext}`,
    upsert: false,
  });

  if (error) {
    const isBucketMissing = error.message?.toLowerCase().includes("bucket") || error.message?.toLowerCase().includes("not found");
    const hint = isBucketMissing
      ? "Storage buckets are missing. Run the storage SQL in your Supabase dashboard SQL editor:\n\n" +
        "insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)\n" +
        "values\n" +
        "  ('post-covers', 'post-covers', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']),\n" +
        "  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])\n" +
        "on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;"
      : error.message;
    console.error("Upload error:", error);
    return NextResponse.json({ error: hint, code: error.name }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({ url: publicUrl, path: data?.path });
}
