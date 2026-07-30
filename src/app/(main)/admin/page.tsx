import Link from "next/link";
import { redirect } from "next/navigation";
import nextDynamic from "next/dynamic";
import { ArrowLeft, Database as DatabaseIcon } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboardClient = nextDynamic(() => import("@/components/blog/admin/AdminDashboardClient").then((mod) => mod.AdminDashboardClient), {
  loading: () => (
    <div className="p-6 space-y-6">
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 flex-1 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  ),
});

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-6 pb-20 pt-10">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <DatabaseIcon className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-heading text-2xl font-bold">Connect Supabase</h1>
        </div>
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: authorData } = await supabase
    .from("authors")
    .select("name, is_staff")
    .eq("user_id", user.id)
    .single();
  const author = authorData as { name: string; is_staff: boolean } | null;

  if (!author?.is_staff) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-20 pt-6">
      <div className="mb-8 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold mt-2">Admin panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage posts, categories, and tags. Signed in as {author.name}.
          </p>
        </div>
      </div>
      <AdminDashboardClient />
    </div>
  );
}
