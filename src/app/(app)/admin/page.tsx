import Link from "next/link";
import { redirect } from "next/navigation";
import nextDynamic from "next/dynamic";
import { ArrowLeft, Database as DatabaseIcon, ShieldAlert } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const AdminDashboardClient = nextDynamic(() => import("@/components/blog/admin/AdminDashboardClient").then((mod) => mod.AdminDashboardClient), {
  loading: () => <div className="flex items-center justify-center h-48"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>,
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
    return (
      <div className="mx-auto max-w-2xl px-6 pb-20 pt-10">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-heading text-2xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only staff authors can access the admin panel.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to your dashboard
          </Link>
        </div>
      </div>
    );
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
