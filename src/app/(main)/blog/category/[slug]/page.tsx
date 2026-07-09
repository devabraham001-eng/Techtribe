import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostGrid } from "@/components/blog/post/PostGrid";
import { getBlogCategories, getBlogPosts } from "@/lib/blog-data";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [categories, posts] = await Promise.all([
    getBlogCategories(),
    getBlogPosts({ category: slug }),
  ]);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
      <div className="space-y-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">
            {category.name}
          </h1>
          <p className="text-muted-foreground text-lg mt-2 max-w-2xl">
            {category.description}
          </p>
        </div>
      </div>

      <PostGrid
        posts={posts}
        variant="vertical"
        columns={3}
      />
    </div>
  );
}
