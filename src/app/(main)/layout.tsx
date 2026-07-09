import { BlogHeader } from "@/components/blog/layout/BlogHeader";
import { BlogFooter } from "@/components/blog/layout/BlogFooter";
import { PageTransition } from "@/components/motion/PageTransition";
import { DashboardSidebarWrapper } from "@/components/blog/dashboard/DashboardSidebarWrapper";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let isAuthenticated = false;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  } catch {}

  if (isAuthenticated) {
    return (
      <main className="flex h-screen" role="main" id="main-content">
        <aside className="w-[245px] flex-shrink-0 hidden lg:block border-r border-border">
          <DashboardSidebarWrapper />
        </aside>
        <div className="flex-1 min-w-0 overflow-y-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
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
