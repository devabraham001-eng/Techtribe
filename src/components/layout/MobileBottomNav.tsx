"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  House,
  Compass,
  Plus,
  Ellipsis,
  Search,
  Settings,
  LogOut,
  Tags,
  Users,
  ArrowRight,
  BookOpen,
  FileEdit,
  BarChart3,
  Shield,
  User,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useWriteModal } from "@/components/blog/dashboard/WriteModalContext";
import { createClient } from "@/lib/supabase/client";

interface MobileBottomNavProps {
  isAuthenticated: boolean;
  isStaff: boolean;
  userName?: string;
  userAvatarUrl?: string;
}

export function MobileBottomNav({ isAuthenticated, isStaff, userName, userAvatarUrl }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { openWriteModal } = useWriteModal();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  React.useEffect(() => {
    if (moreOpen) {
      setMoreOpen(false);
    }
  }, [pathname]);

  React.useEffect(() => {
    if (moreOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [moreOpen]);

  const tabs = isAuthenticated
    ? [
        { id: "dashboard", label: "Dashboard", icon: House, href: "/dashboard" },
        { id: "learn", label: "Learn", icon: BookOpen, href: "/learn" },
        { id: "blog", label: "Blog", icon: Compass, href: "/blog" },
        { id: "write", label: "Write", icon: Plus, href: "", action: "writeModal" as const },
        { id: "more", label: "More", icon: Ellipsis, href: "", action: "moreSheet" as const },
      ]
    : [
        { id: "home", label: "Home", icon: House, href: "/" },
        { id: "blog", label: "Blog", icon: Compass, href: "/blog" },
        { id: "search", label: "Search", icon: Search, href: "/blog/search" },
        { id: "more", label: "More", icon: Ellipsis, href: "", action: "moreSheet" as const },
      ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const moreLinks = isAuthenticated
    ? [
        { label: "Drafts", icon: FileEdit, href: "/blog/write?status=draft" },
        { label: "Categories", icon: Tags, href: "/blog/categories" },
        { label: "Authors", icon: Users, href: "/blog/authors" },
        ...(isStaff
          ? [
              { label: "Admin", icon: Shield, href: "/admin" },
              { label: "  Analytics", icon: BarChart3, href: "/admin/analytics" },
              { label: "  Learning", icon: BookOpen, href: "/admin/learning" },
            ]
          : []),
        { label: "Settings", icon: Settings, href: "/settings" },
      ]
    : [
        { label: "Categories", icon: Tags, href: "/blog/categories" },
        { label: "Authors", icon: Users, href: "/blog/authors" },
      ];

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-background/95 backdrop-blur-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-14">
          {tabs.map((tab) => {
            const active = tab.href ? isActive(tab.href) : false;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.action === "writeModal") {
                    openWriteModal();
                  } else if (tab.action === "moreSheet") {
                    setMoreOpen(true);
                  } else if (tab.href) {
                    router.push(tab.href);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`relative p-1 ${active ? "bg-primary/10 rounded-lg" : ""}`}>
                  <Icon className={`h-5 w-5 ${active ? "fill-primary/20" : ""}`} />
                </div>
                <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              key="more-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              key="more-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card border border-border lg:hidden"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              <div className="px-4 pt-3 pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                </div>

                {isAuthenticated && (userName || userAvatarUrl) && (
                  <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-muted/30">
                    <Avatar className="h-10 w-10">
                      {userAvatarUrl ? (
                        <AvatarImage src={userAvatarUrl} alt={userName || ""} />
                      ) : (
                        <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <AvatarFallback className="text-sm">{(userName || "U").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{userName || "User"}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {moreLinks.map((link) => {
                    const LinkIcon = link.icon;
                    const isSubItem = link.label.startsWith("  ");
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium ${
                          isSubItem ? "pl-10 text-muted-foreground text-xs" : ""
                        }`}
                        onClick={() => setMoreOpen(false)}
                      >
                        <LinkIcon className={`h-5 w-5 ${isSubItem ? "h-4 w-4" : ""} text-muted-foreground`} />
                        {link.label.trim()}
                      </Link>
                    );
                  })}
                  {!isAuthenticated && (
                    <>
                      <hr className="my-2 border-border" />
                      <Link
                        href="/login"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium"
                        style={{ color: "#D0F201" }}
                        onClick={() => setMoreOpen(false)}
                      >
                        <ArrowRight className="h-5 w-5" />
                        Sign In / Register
                      </Link>
                    </>
                  )}
                  {isAuthenticated && (
                    <>
                      <hr className="my-2 border-border" />
                      <button
                        type="button"
                        disabled={signingOut}
                        onClick={async () => {
                          setSigningOut(true);
                          try {
                            const supabase = createClient();
                            await supabase.auth.signOut();
                          } catch {}
                          router.push("/blog");
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition-colors text-sm font-medium text-destructive disabled:opacity-50"
                      >
                        {signingOut ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <LogOut className="h-5 w-5" />
                        )}
                        Sign Out
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
