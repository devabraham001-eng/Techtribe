import { redirect } from "next/navigation";
import nextDynamic from "next/dynamic";
import { Database as DatabaseIcon } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Skeleton } from "@/components/ui/skeleton";

const AuthorDashboardClient = nextDynamic(() => import("@/components/blog/dashboard/AuthorDashboardClient").then((mod) => mod.AuthorDashboardClient), {
  loading: () => (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 min-w-[72px]">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-6" />
          </div>
        ))}
      </div>
      <Skeleton className="h-5 w-32" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  ),
});

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

  try {
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
  } catch {
    return (
      <div className="mx-auto max-w-2xl px-6 pb-20 pt-10">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <DatabaseIcon className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-heading text-2xl font-bold">Connection error</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Could not connect to the database. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
