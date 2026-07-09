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
} from "lucide-react";
import { useWriteModal } from "./WriteModalContext";

interface SidebarProps {
  authorName: string;
  authorAvatar: string | null;
  isStaff: boolean;
}

export function DashboardSidebar({ authorName, authorAvatar, isStaff }: SidebarProps) {
  const pathname = usePathname();
  const { openWriteModal } = useWriteModal();

  return (
    <nav className="flex h-full flex-col" aria-label="Dashboard navigation">
      <div className="px-3 pb-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg" style={{ letterSpacing: "-0.02em" }}>
          <span style={{ color: "#f5f5f7" }}>TechTribe</span>
        </Link>
      </div>

      <div className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            pathname === "/dashboard"
              ? "bg-card font-semibold text-foreground"
              : "text-muted-foreground hover:bg-card hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
          <span>Dashboard</span>
        </Link>

        {/* Write - opens modal */}
        <button
          type="button"
          onClick={() => openWriteModal()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors text-left"
        >
          <PenLine className="h-5 w-5 flex-shrink-0" />
          <span>Write</span>
        </button>

        {/* Published */}
        <Link
          href="/blog"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            pathname === "/blog"
              ? "bg-card font-semibold text-foreground"
              : "text-muted-foreground hover:bg-card hover:text-foreground"
          }`}
        >
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span>Published</span>
        </Link>

        {/* Drafts - opens modal */}
        <button
          type="button"
          onClick={() => openWriteModal()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors text-left"
        >
          <FileEdit className="h-5 w-5 flex-shrink-0" />
          <span>Drafts</span>
        </button>

        {/* Settings */}
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            pathname === "/settings"
              ? "bg-card font-semibold text-foreground"
              : "text-muted-foreground hover:bg-card hover:text-foreground"
          }`}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          <span>Settings</span>
        </Link>

        {isStaff && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              pathname === "/admin"
                ? "bg-card font-semibold text-foreground"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            }`}
          >
            <Shield className="h-5 w-5 flex-shrink-0" />
            <span>Admin</span>
          </Link>
        )}
      </div>

      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden">
            {authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-fg-tertiary">
                {authorName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate text-foreground">{authorName}</p>
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
