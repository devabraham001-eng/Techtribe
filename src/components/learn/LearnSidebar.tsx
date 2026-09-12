"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  ArrowUp,
  ArrowUpRight,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Play,
  Settings,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const LEARN_SIDEBAR_STORAGE_KEY = "techtribe_sidebar_collapsed";

export interface LearnNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: LearnNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { id: "practice", label: "Practice", href: "/learn/practice", icon: MessageSquare },
  { id: "schedule", label: "Schedule", href: "/learn#scheduled", icon: Calendar },
  { id: "videos", label: "Video guides", href: "/learn/video-guides", icon: Play },
  { id: "notifications", label: "Notifications", href: "/dashboard", icon: Bell },
  { id: "achievements", label: "Achievements", href: "/dashboard", icon: Trophy },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings },
];

function PromoAvatar() {
  // Decorative character illustration from the reference (no icon equivalent).
  return (
    <svg className="mt-2 h-14 w-14" fill="none" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M20 70C20 53.4315 33.4315 40 50 40C66.5685 40 80 53.4315 80 70V100H20V70Z" fill="#F4D3BD" />
      <path
        d="M22 36C22 36 34 22 55 24C68 25 76 34 76 34L86 38L64 45L40 44L22 36Z"
        fill="#D0F201"
        stroke="#10180B"
        strokeWidth="3"
      />
      <circle cx="43" cy="56" fill="#10180B" r="3" />
      <circle cx="63" cy="56" fill="#10180B" r="3" />
      <path d="M50 63C53 67 59 67 62 63" stroke="#10180B" strokeLinecap="round" strokeWidth="2.5" />
      <path
        d="M20 40C20 40 32 30 52 32C66 33.5 73 42 73 42"
        stroke="#10180B"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export function LearnSidebar({ activeId = "dashboard" }: { activeId?: string }) {
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LEARN_SIDEBAR_STORAGE_KEY) === "true";
    }
    return false;
  });

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LEARN_SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }

  const rowClass = (active: boolean) =>
    cn(
      "flex items-center gap-3.5 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
      collapsed && "md:mx-auto md:h-10 md:w-10 md:justify-center md:gap-0 md:px-0",
      active
        ? "bg-card text-foreground"
        : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
    );

  return (
    <aside
      aria-label="Learn navigation"
      className={cn(
        "flex w-full shrink-0 flex-col justify-between border-b border-border bg-secondary p-6 transition-all duration-200 md:min-h-screen md:border-b-0 md:border-r",
        collapsed ? "md:w-[76px] md:px-3" : "md:w-64"
      )}
    >
      <div className="space-y-8">
        <div className={cn("flex items-center", collapsed && "md:justify-center")}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image src="/ttlg.png" alt="TechTribe" width={28} height={28} className="h-7 w-auto" />
            <span
              className={cn("font-heading text-lg font-bold", collapsed && "md:hidden")}
              style={{ letterSpacing: "-0.02em", color: "#f5f5f7" }}
            >
              TechTribe
            </span>
          </Link>
        </div>
        <nav aria-label="Main Navigation" className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeId;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={rowClass(active)}
              >
                <Icon
                  className={cn("h-4 w-4 shrink-0", active && "text-foreground")}
                  strokeWidth={active ? 2.2 : 2}
                  aria-hidden="true"
                />
                <span className={cn(collapsed && "md:hidden")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-6">
        {collapsed ? (
          <div className="hidden justify-center md:flex">
            <Link
              href="/settings"
              title="Upgrade to Plus"
              aria-label="Upgrade to Plus"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition hover:bg-primary-dark"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="relative mt-8 pt-8">
            <div className="relative flex flex-col items-center overflow-hidden rounded-2xl bg-primary p-4 text-center">
              <div className="absolute -top-7 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border-4 border-secondary bg-white shadow-lg">
                <PromoAvatar />
              </div>
              <div className="mb-3 mt-6">
                <h3 className="flex items-center justify-center gap-1.5 text-base font-extrabold leading-tight tracking-tight text-primary-foreground">
                  Level
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-black text-primary">
                    <ArrowUp className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  Up
                </h3>
                <p className="text-base font-extrabold leading-tight text-primary-foreground">with Plus</p>
              </div>
              <Link
                href="/settings"
                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary-foreground px-3 py-2 text-xs font-semibold text-primary shadow transition hover:opacity-90"
              >
                <span>Upgrade Now</span>
                <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
        <div className="mt-4 space-y-1.5 border-t border-border pt-4">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className={cn(rowClass(false), "w-full")}
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span className={cn(collapsed && "md:hidden")}>Sign out</span>
            </button>
          </form>
          <button
            type="button"
            onClick={toggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className={cn(rowClass(false), "hidden w-full md:flex")}
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
    </aside>
  );
}

export function useHideGlobalSidebar() {
  // The Learn section ships its own full app shell, so hide the global
  // dashboard sidebar while a Learn shell page is mounted.
  React.useEffect(() => {
    const el = document.getElementById("techtribe-global-sidebar");
    if (!el) return;
    const previous = el.style.display;
    el.style.display = "none";
    return () => {
      el.style.display = previous;
    };
  }, []);
}

export function LearnShell({
  activeId = "dashboard",
  children,
}: {
  activeId?: string;
  children: React.ReactNode;
}) {
  useHideGlobalSidebar();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground md:flex-row">
      <LearnSidebar activeId={activeId} />
      <main className="flex min-w-0 flex-1 flex-col bg-background">{children}</main>
    </div>
  );
}
