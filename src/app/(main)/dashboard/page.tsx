import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Database as DatabaseIcon } from "lucide-react";
import { AuthorDashboardClient } from "@/components/blog/dashboard/AuthorDashboardClient";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-6 pb-20 pt-10">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <DatabaseIcon className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-heading text-2xl font-bold">Connect Supabase</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your Supabase URL and key to <code>.env.local</code> to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: authorData } = await supabase
    .from("authors")
    .select("id, name, is_staff")
    .eq("user_id", user.id)
    .single();
  const author = authorData as { id: string; name: string; is_staff: boolean } | null;

  if (!author) {
    return (
      <div className="mx-auto max-w-2xl px-6 pb-20 pt-10">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <h1 className="font-heading text-2xl font-bold">Author profile not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your author profile hasn&apos;t been created yet. Try signing out and signing back in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-6">
      <div className="mb-8 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <Link
            href="/blog"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold mt-2">Your dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome, {author.name}. Manage your articles and view stats.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/blog/write"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Write new article
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      <AuthorDashboardClient authorId={author.id} isStaff={author.is_staff} />
    </div>
  );
}
