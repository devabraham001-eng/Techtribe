import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Database as DatabaseIcon } from "lucide-react";
import { PostEditor } from "@/components/blog/editor/PostEditor";
import { Button } from "@/components/ui/button";
import { getBlogCategories, getBlogTags } from "@/lib/blog-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type AuthorAccess = Pick<
  Database["public"]["Tables"]["authors"]["Row"],
  "is_staff"
>;

export const dynamic = "force-dynamic";

export default async function WritePage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-6 pb-20">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <DatabaseIcon className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-heading text-2xl font-bold">Connect Supabase to write</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your Supabase URL and anonymous key to <code>.env.local</code>, then run the
            current <code>supabase-schema.sql</code> in the Supabase SQL editor.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/blog/write");
  }

  const [{ data: authorData }, categories, tags] = await Promise.all([
    supabase.from("authors").select("is_staff").eq("user_id", user.id).single(),
    getBlogCategories(),
    getBlogTags(),
  ]);
  const author = authorData as AuthorAccess | null;

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Write an article</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Save work as a draft. Staff authors can publish immediately.
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
      <PostEditor categories={categories} tags={tags} canPublish={Boolean(author?.is_staff)} />
    </div>
  );
}
