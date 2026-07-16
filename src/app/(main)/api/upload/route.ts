import { NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const ALLOWED_BUCKETS = ["post-covers", "avatars"] as const;

async function ensureBucket(bucket: string): Promise<string | null> {
  const admin = createAdminSupabaseClient();
  if (!admin) return null;
  const { error } = await admin.storage.getBucket(bucket);
  if (error?.message?.toLowerCase().includes("not found")) {
    const { error: createError } = await admin.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (createError) return createError.message;
  }
  return null;
}

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

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_BUCKETS.includes(bucket as typeof ALLOWED_BUCKETS[number])) {
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

  const admin = createAdminSupabaseClient();
  const storageClient = admin?.storage ?? supabase.storage;
  const storage = storageClient.from(bucket);

  const { data, error } = await storage.upload(path, buffer, {
    contentType: file.type || `image/${ext}`,
    upsert: false,
  });

  if (error) {
    const isBucketMissing = error.message?.toLowerCase().includes("bucket") ||
                            error.message?.toLowerCase().includes("not found");

    if (isBucketMissing && admin) {
      const createErr = await ensureBucket(bucket);
      if (createErr) {
        return NextResponse.json({ error: `Failed to create bucket: ${createErr}` }, { status: 500 });
      }
      const { data: retryData, error: retryError } = await storage.upload(path, buffer, {
        contentType: file.type || `image/${ext}`,
        upsert: false,
      });
      if (retryError) {
        return NextResponse.json({ error: retryError.message, code: retryError.name }, { status: 500 });
      }
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      return NextResponse.json({ url: publicUrl, path: retryData?.path });
    }

    if (isBucketMissing && !admin) {
      return NextResponse.json({
        error: "Storage buckets are missing. Add SUPABASE_SERVICE_ROLE_KEY to your env to auto-create, or run this SQL in your Supabase SQL Editor:",
        hint: "insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('post-covers', 'post-covers', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']), ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']) on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;",
        code: "BUCKET_MISSING",
      }, { status: 500 });
    }

    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message, code: error.name }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({ url: publicUrl, path: data?.path });
}
