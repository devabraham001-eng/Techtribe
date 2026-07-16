import { BlogHeader } from "@/components/blog/layout/BlogHeader";
import { BlogFooter } from "@/components/blog/layout/BlogFooter";
import { PageTransition } from "@/components/motion/PageTransition";
import { DashboardSidebarWrapper } from "@/components/blog/dashboard/DashboardSidebarWrapper";
import { WriteModalProvider } from "@/components/blog/dashboard/WriteModalContext";
import { WriteModal } from "@/components/blog/dashboard/WriteModal";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let isAuthenticated = false;
  let isStaff = false;
  try {
    const supabase = await createServerSupabaseClient();
    const userResult = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Auth timeout")), 4000)
      ),
    ]);
    const user = (userResult as Awaited<ReturnType<typeof supabase.auth.getUser>>).data?.user ?? null;
    isAuthenticated = !!user;
    if (user) {
      const authorResult = await Promise.race([
        supabase.from("authors").select("is_staff").eq("user_id", user.id).single(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Author query timeout")), 3000)
        ),
      ]);
      isStaff = (authorResult as { data: { is_staff: boolean } | null }).data?.is_staff ?? false;
    }
  } catch {}

  if (isAuthenticated) {
    return (
      <WriteModalProvider>
        <main className="flex h-screen" role="main" id="main-content">
          <aside className="flex-shrink-0 hidden lg:block border-r border-border overflow-hidden">
            <DashboardSidebarWrapper />
          </aside>
          <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-16 md:pb-0">
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

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:inset-x-4 focus:top-4 focus:block focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-center focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <BlogHeader />
      <main id="main-content" className="flex-1 pt-28 md:pt-36" role="main">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <BlogFooter />
    </>
  );
}
