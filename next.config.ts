import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.vercel.app",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn", "info", "assert"] }
      : false,
  },

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "framer-motion",
      "recharts",
      "react-markdown",
      "next-mdx-remote",
      "@supabase/supabase-js",
      "@supabase/ssr",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-dialog",
      "@monaco-editor/react",
    ],
    // Cache client-router RSC payloads briefly so repeat visits and
    // back/forward navigations resolve instantly.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/blog/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
      {
        source: "/feed.xml",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;