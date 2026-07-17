import type { Metadata } from "next";
import { BlogLayout } from "@/components/blog/layout/BlogLayout";

export const metadata: Metadata = {
  title: "TechTribe Blog — Learn, Build, Get Hired",
  description: "Discover tutorials, freelance tips, tech news, and career guides for developers. Join the TechTribe community.",
  openGraph: {
    title: "TechTribe Blog — Learn, Build, Get Hired",
    description: "Discover tutorials, freelance tips, tech news, and career guides for developers.",
    type: "website",
    images: [{ url: "/ttlg.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechTribe Blog",
    description: "Discover tutorials, freelance tips, tech news, and career guides for developers.",
  },
};

export default function BlogRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BlogLayout>
      {children}
    </BlogLayout>
  );
}