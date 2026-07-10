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
  LogOut,
  Tags,
  Users,
  ArrowRight,
} from "lucide-react";

interface MobileBottomNavProps {
  isAuthenticated: boolean;
}

export function MobileBottomNav({ isAuthenticated }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = React.useState(false);

  React.useEffect(() => {
    setMoreOpen(false);
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
        { id: "home", label: "Home", icon: House, href: "/" },
        { id: "blog", label: "Blog", icon: Compass, href: "/blog" },
        { id: "write", label: "Write", icon: Plus, href: "", action: () => router.push("/blog/write") },
        { id: "more", label: "More", icon: Ellipsis, href: "", action: () => setMoreOpen(true) },
      ]
    : [
        { id: "home", label: "Home", icon: House, href: "/" },
        { id: "blog", label: "Blog", icon: Compass, href: "/blog" },
        { id: "search", label: "Search", icon: Search, href: "/blog/search" },
        { id: "more", label: "More", icon: Ellipsis, href: "", action: () => setMoreOpen(true) },
      ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const moreLinks = isAuthenticated
    ? [
        { label: "Categories", icon: Tags, href: "/blog/categories" },
        { label: "Authors", icon: Users, href: "/blog/authors" },
      ]
    : [
        { label: "Categories", icon: Tags, href: "/blog/categories" },
        { label: "Authors", icon: Users, href: "/blog/authors" },
      ];

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur-lg"
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
                onClick={() => (tab.action ? tab.action() : tab.href && router.push(tab.href))}
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
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              key="more-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card border border-border md:hidden"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              <div className="px-4 pt-3 pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                </div>
                <div className="space-y-1">
                  {moreLinks.map((link) => {
                    const LinkIcon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium"
                        onClick={() => setMoreOpen(false)}
                      >
                        <LinkIcon className="h-5 w-5 text-muted-foreground" />
                        {link.label}
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
                      <Link
                        href="/auth/signout"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition-colors text-sm font-medium text-destructive"
                        onClick={() => setMoreOpen(false)}
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </Link>
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
