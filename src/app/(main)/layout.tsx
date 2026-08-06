import { BlogHeader } from "@/components/blog/layout/BlogHeader";
import { BlogFooter } from "@/components/blog/layout/BlogFooter";
import { PageTransition } from "@/components/motion/PageTransition";
import { DashboardSidebar } from "@/components/blog/dashboard/DashboardSidebar";
import { WriteModalProvider } from "@/components/blog/dashboard/WriteModalContext";
import { WriteModal } from "@/components/blog/dashboard/WriteModal";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let isAuthenticated = false;
  let isStaff = false;
  let userName: string | undefined;
  let userAvatarUrl: string | undefined;
  try {
    const supabase = await createServerSupabaseClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data?.user ?? null;
    isAuthenticated = !!user;
    if (user) {
      const authorResult = await supabase
        .from("authors")
        .select("is_staff, name, avatar_url")
        .eq("user_id", user.id)
        .single();
      const authorData = (authorResult as { data: { is_staff: boolean; name: string; avatar_url: string | null } | null }).data;
      isStaff = authorData?.is_staff ?? false;
      userName = authorData?.name ?? user.email ?? undefined;
      userAvatarUrl = authorData?.avatar_url ?? undefined;
    }
  } catch {}

  if (isAuthenticated) {
    return (
      <WriteModalProvider>
        <main className="flex h-screen" role="main" id="main-content">
          <aside className="flex-shrink-0 hidden lg:block border-r border-border overflow-hidden">
            <DashboardSidebar
              authorName={userName ?? "User"}
              authorAvatar={userAvatarUrl ?? null}
              isStaff={isStaff}
            />
          </aside>
          <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-16 md:pb-0">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
        <MobileBottomNav isAuthenticated={true} isStaff={isStaff} userName={userName} userAvatarUrl={userAvatarUrl} />
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
