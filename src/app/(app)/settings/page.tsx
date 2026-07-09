import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Database as DatabaseIcon } from "lucide-react";
import { SettingsForm } from "@/components/auth/SettingsForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

type AuthorRow = Database["public"]["Tables"]["authors"]["Row"];

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
    .select("*")
    .eq("user_id", user.id)
    .single();

  const author = authorData as AuthorRow | null;

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
