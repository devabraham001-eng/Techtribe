import { DashboardSidebarWrapper } from "@/components/blog/dashboard/DashboardSidebarWrapper";
import { WriteModalProvider } from "@/components/blog/dashboard/WriteModalContext";
import { WriteModal } from "@/components/blog/dashboard/WriteModal";
import { PageTransition } from "@/components/motion/PageTransition";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let isStaff = false;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: author } = await supabase
        .from("authors")
        .select("is_staff")
        .eq("user_id", user.id)
        .single();
      isStaff = (author as { is_staff: boolean } | null)?.is_staff ?? false;
    }
  } catch {}

  return (
    <WriteModalProvider>
      <main className="flex h-screen" role="main">
        <aside className="flex-shrink-0 hidden lg:block border-r border-border overflow-hidden">
          <DashboardSidebarWrapper />
        </aside>

        <div className="flex-1 min-w-0 overflow-y-auto pb-16 md:pb-0">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
      <MobileBottomNav isAuthenticated={true} isStaff={isStaff} />
      <WriteModal />
    </WriteModalProvider>
  );
}
