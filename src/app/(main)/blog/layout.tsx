import type { Metadata } from "next";
import { BlogLayout } from "@/components/blog/layout/BlogLayout";

export const metadata: Metadata = {
  title: "TechTribe Blog — Learn, Build, Get Hired",
  description: "Discover tutorials, freelance tips, tech news, and career guides for developers. Join the TechTribe community.",
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