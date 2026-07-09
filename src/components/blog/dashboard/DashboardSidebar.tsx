"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenLine,
  CheckCircle,
  FileEdit,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useWriteModal } from "./WriteModalContext";

interface SidebarProps {
  authorName: string;
  authorAvatar: string | null;
  isStaff: boolean;
}

const STORAGE_KEY = "techtribe_sidebar_collapsed";

export function DashboardSidebar({ authorName, authorAvatar, isStaff }: SidebarProps) {
  const pathname = usePathname();
  const { openWriteModal } = useWriteModal();
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  const linkClass = (href: string) =>
    `flex items-center gap-3 rounded-lg transition-colors ${
      collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5"
    } ${
      pathname === href
        ? "bg-card font-semibold text-foreground"
        : "text-muted-foreground hover:bg-card hover:text-foreground"
    }`;

  const iconClass = "h-5 w-5 flex-shrink-0";

  return (
    <div
      className={`flex flex-col h-full transition-all duration-200 ease-in-out ${
        collapsed ? "w-[72px]" : "w-[245px]"
      }`}
    >
      <nav className="flex flex-col h-full" aria-label="Dashboard navigation">
        {/* Logo */}
        <div className="border-b border-border flex-shrink-0">
          <Link
            href="/dashboard"
            className={`flex items-center h-14 ${
              collapsed ? "justify-center px-0" : "gap-2.5 px-3"
            }`}
          >
            {collapsed ? (
              <span className="font-heading font-bold text-lg text-foreground">TT</span>
            ) : (
              <span className="font-heading font-bold text-lg" style={{ letterSpacing: "-0.02em", color: "#f5f5f7" }}>
                TechTribe
              </span>
            )}
          </Link>
        </div>

        {/* Nav items */}
        <div className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          <Link href="/dashboard" className={linkClass("/dashboard")} title="Dashboard">
            <LayoutDashboard className={iconClass} />
            {!collapsed && <span>Dashboard</span>}
          </Link>

          <button
            type="button"
            onClick={() => openWriteModal()}
            className={`flex w-full items-center gap-3 rounded-lg transition-colors text-left ${
              collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5"
            } text-muted-foreground hover:bg-card hover:text-foreground`}
            title="Write"
          >
            <PenLine className={iconClass} />
            {!collapsed && <span>Write</span>}
          </button>

          <Link href="/blog" className={linkClass("/blog")} title="Published">
            <CheckCircle className={iconClass} />
            {!collapsed && <span>Published</span>}
          </Link>

          <button
            type="button"
            onClick={() => openWriteModal()}
            className={`flex w-full items-center gap-3 rounded-lg transition-colors text-left ${
              collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5"
            } text-muted-foreground hover:bg-card hover:text-foreground`}
            title="Drafts"
          >
            <FileEdit className={iconClass} />
            {!collapsed && <span>Drafts</span>}
          </button>

          <Link href="/settings" className={linkClass("/settings")} title="Settings">
            <Settings className={iconClass} />
            {!collapsed && <span>Settings</span>}
          </Link>

          {isStaff && (
            <Link href="/admin" className={linkClass("/admin")} title="Admin">
              <Shield className={iconClass} />
              {!collapsed && <span>Admin</span>}
            </Link>
          )}
        </div>

        {/* User & sign out */}
        <div className="border-t border-border flex-shrink-0">
          <div className={`flex items-center ${collapsed ? "justify-center py-3" : "gap-3 px-3 py-3"}`}>
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden" title={authorName}>
              {authorAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-fg-tertiary">
                  {authorName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate text-foreground">{authorName}</p>
              </div>
            )}
          </div>

          <form action="/auth/signout" method="post" className={collapsed ? "px-2 pb-3" : "px-3 pb-3"}>
            <button
              type="submit"
              className={`flex w-full items-center gap-3 rounded-lg transition-colors ${
                collapsed ? "justify-center px-2 py-2" : "px-3 py-2"
              } text-muted-foreground hover:bg-card hover:text-foreground`}
              title="Sign out"
            >
              <LogOut className={iconClass} />
              {!collapsed && <span>Sign out</span>}
            </button>
          </form>

          {/* Collapse toggle */}
          <div className={collapsed ? "px-2 pb-3" : "px-3 pb-3"}>
            <button
              type="button"
              onClick={toggleCollapse}
              className={`flex w-full items-center gap-3 rounded-lg transition-colors ${
                collapsed ? "justify-center px-2 py-2" : "px-3 py-2"
              } text-muted-foreground hover:bg-card hover:text-foreground`}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className={iconClass} />
              ) : (
                <>
                  <ChevronLeft className={iconClass} />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
