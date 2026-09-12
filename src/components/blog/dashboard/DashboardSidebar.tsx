"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWriteModal } from "./WriteModalContext";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileEdit,
  GraduationCap,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Newspaper,
  PenLine,
  Play,
  Settings,
  Shield,
  Terminal,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SidebarProps {
  authorName?: string;
  authorAvatar?: string | null;
  isStaff?: boolean;
  isAuthenticated?: boolean;
}

const STORAGE_KEY = "techtribe_sidebar_collapsed";

type WriteAction = "write" | "drafts";

interface SubMenuItem {
  id: string;
  label: string;
  href?: string;
  action?: WriteAction;
  icon: LucideIcon;
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  staffOnly?: boolean;
  children?: SubMenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  {
    id: "learn",
    label: "Learn",
    href: "/learn",
    icon: GraduationCap,
    children: [
      { id: "practice", label: "Practice", href: "/learn/practice", icon: MessageSquare },
      { id: "videos", label: "Video guides", href: "/learn/video-guides", icon: Play },
      { id: "achievements", label: "Achievements", href: "/dashboard", icon: Trophy },
    ],
  },
  {
    id: "blog",
    label: "Blog",
    href: "/blog",
    icon: Newspaper,
    children: [
      { id: "write", label: "Write", action: "write", icon: PenLine },
      { id: "drafts", label: "Drafts", action: "drafts", icon: FileEdit },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    href: "/admin",
    icon: Shield,
    staffOnly: true,
    children: [
      { id: "analytics", label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { id: "learning", label: "Learning", href: "/admin/learning", icon: BookOpen },
      { id: "practice-admin", label: "Practice", href: "/admin/practice", icon: Terminal },
    ],
  },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings },
];

function isPathActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function DashboardSidebar({
  authorName = "User",
  authorAvatar = null,
  isStaff = false,
  isAuthenticated = true,
}: SidebarProps) {
  const pathname = usePathname();
  const { openWriteModal } = useWriteModal();
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) === "true";
    }
    return false;
  });
  // Manual expand/collapse overrides. A section with no manual override
  // auto-expands when the current route lives inside it.
  const [manualOpen, setManualOpen] = React.useState<Record<string, boolean>>({});

  function toggleCollapse() {    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }

  function toggleMenu(id: string) {
    setManualOpen((prev) => {
      const menu = visibleMenus.find((m) => m.id === id);
      const currentlyOpen = prev[id] ?? (menu ? menuMatches(menu) : false);
      return { ...prev, [id]: !currentlyOpen };
    });
  }

  const visibleMenus = MENU_ITEMS.filter((menu) => !menu.staffOnly || isStaff);

  function menuMatches(menu: MenuItem): boolean {
    if (isPathActive(pathname, menu.href)) return true;
    return (menu.children ?? []).some((child) => child.href && isPathActive(pathname, child.href));
  }

  function isMenuOpen(menu: MenuItem): boolean {
    return manualOpen[menu.id] ?? menuMatches(menu);
  }

  const rowClass = (active: boolean) =>
    cn(
      "flex items-center gap-3.5 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
      collapsed && "mx-auto h-10 w-10 justify-center gap-0 px-0",
      active
        ? "bg-card text-foreground"
        : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
    );

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between bg-secondary p-6 transition-all duration-200",
        collapsed ? "w-[76px] px-3" : "w-[245px]"
      )}
    >
      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto">
        <div className={cn("flex items-center", collapsed && "justify-center")}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image src="/ttlg.png" alt="TechTribe" width={28} height={28} className="h-7 w-auto" />
            <span
              className={cn("font-heading text-lg font-bold", collapsed && "hidden")}
              style={{ letterSpacing: "-0.02em", color: "#f5f5f7" }}
            >
              TechTribe
            </span>
          </Link>
        </div>
        <nav aria-label="Dashboard navigation" className="space-y-1.5">
          {visibleMenus.map((menu) => {
            const Icon = menu.icon;
            const active = menuMatches(menu);
            const expanded = isMenuOpen(menu) && !collapsed;
            return (
              <div key={menu.id}>
                <div className={rowClass(active)}>
                  <Link
                    href={menu.href}
                    aria-current={active && !menu.children ? "page" : undefined}
                    title={collapsed ? menu.label : undefined}
                    aria-label={collapsed ? menu.label : undefined}
                    className="flex min-w-0 flex-1 items-center gap-3.5"
                  >
                    <Icon
                      className={cn("h-4 w-4 shrink-0", active && "text-foreground")}
                      strokeWidth={active ? 2.2 : 2}
                      aria-hidden="true"
                    />
                    <span className={cn("truncate", collapsed && "hidden")}>{menu.label}</span>
                  </Link>
                  {menu.children && !collapsed && (
                    <button
                      type="button"
                      onClick={() => toggleMenu(menu.id)}
                      title={expanded ? `Collapse ${menu.label}` : `Expand ${menu.label}`}
                      aria-label={expanded ? `Collapse ${menu.label}` : `Expand ${menu.label}`}
                      aria-expanded={expanded}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-card-hover hover:text-foreground"
                    >
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
                {menu.children && expanded && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-border pl-3">
                    {menu.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = child.href ? isPathActive(pathname, child.href) : false;
                      const childRow = cn(
                        "flex w-full items-center gap-3 rounded-full px-3 py-2 text-left text-[13px] font-medium transition-colors",
                        childActive
                          ? "bg-card text-foreground"
                          : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                      );
                      return child.href ? (
                        <Link
                          key={child.id}
                          href={child.href}
                          aria-current={childActive ? "page" : undefined}
                          className={childRow}
                        >
                          <ChildIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                          <span className="truncate">{child.label}</span>
                        </Link>
                      ) : (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => openWriteModal()}
                          className={childRow}
                        >
                          <ChildIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                          <span className="truncate">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 shrink-0">
        {isAuthenticated ? (
          <div className="mt-4 space-y-1.5 border-t border-border pt-4">
            <div className={cn("flex items-center gap-3 px-4 py-1", collapsed && "justify-center px-0")}>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-card"
                title={authorName}
              >
                {authorAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">
                    {authorName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <p className={cn("min-w-0 flex-1 truncate text-sm font-medium text-foreground", collapsed && "hidden")}>
                {authorName}
              </p>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                title="Sign out"
                aria-label="Sign out"
                className={cn(rowClass(false), "w-full")}
              >
                <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                <span className={cn(collapsed && "hidden")}>Sign out</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-4 border-t border-border pt-4">
            <Link
              href="/login"
              title="Sign in"
              className="flex w-full items-center gap-3.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              <LogOut className="h-4 w-4 shrink-0 rotate-180" aria-hidden="true" />
              <span>Sign in</span>
            </Link>
          </div>
        )}

        <div className="mt-1.5">
          <button
            type="button"
            onClick={toggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={cn(rowClass(false), "w-full")}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
