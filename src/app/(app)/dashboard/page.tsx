import { redirect } from "next/navigation";
import { Database as DatabaseIcon } from "lucide-react";
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
    .select("id, name, bio, avatar_url, is_staff")
    .eq("user_id", user.id)
    .single();
  const author = authorData as {
    id: string;
    name: string;
    bio: string | null;
    avatar_url: string | null;
    is_staff: boolean;
  } | null;

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
    <AuthorDashboardClient
      authorId={author.id}
      authorName={author.name}
      authorBio={author.bio}
      authorAvatar={author.avatar_url}
      isStaff={author.is_staff}
    />
  );
}
