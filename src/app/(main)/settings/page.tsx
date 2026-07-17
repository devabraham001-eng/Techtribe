import Link from "next/link";
import { redirect } from "next/navigation";
import nextDynamic from "next/dynamic";
import { ArrowLeft, Database as DatabaseIcon } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const SettingsForm = nextDynamic(() => import("@/components/auth/SettingsForm").then((mod) => mod.SettingsForm), {
  loading: () => <div className="flex items-center justify-center h-48"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>,
});

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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
    redirect("/login?next=/settings");
  }

  const { data: authorData } = await supabase
    .from("authors")
    .select("id, name, slug, bio, avatar_url, twitter, github, linkedin, website, is_staff, status, created_at, updated_at")
    .eq("user_id", user.id)
    .single();

  const author = authorData as {
    id: string; name: string; slug: string; bio: string | null;
    avatar_url: string | null; twitter: string | null; github: string | null;
    linkedin: string | null; website: string | null; is_staff: boolean;
    status: 'open_to_work' | 'hiring' | 'mentoring' | 'open_for_mentorship' | null;
    created_at: string; updated_at: string;
  } | null;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 pb-10 sm:pb-20 pt-6">
      <Link
        href="/dashboard"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">Account settings</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Update your author profile and social links.
      </p>
      <SettingsForm author={author} />
    </div>
  );
}
