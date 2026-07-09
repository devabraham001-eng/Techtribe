import { DashboardSidebarWrapper } from "@/components/blog/dashboard/DashboardSidebarWrapper";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex h-screen" role="main">
      <aside className="w-[245px] flex-shrink-0 hidden lg:block border-r border-border">
        <DashboardSidebarWrapper />
      </aside>

      <div className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </div>
    </main>
  );
}
