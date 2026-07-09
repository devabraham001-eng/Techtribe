import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "./DashboardSidebar";

export async function DashboardSidebarWrapper() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("authors")
    .select("name, avatar_url, is_staff")
    .eq("user_id", user.id)
    .single();

  const author = data as { name: string; avatar_url: string | null; is_staff: boolean } | null;
  if (!author) return null;

  return (
    <DashboardSidebar
      authorName={author.name}
      authorAvatar={author.avatar_url}
      isStaff={author.is_staff}
    />
  );
}
