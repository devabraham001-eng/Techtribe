import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostGrid } from "@/components/blog/post/PostGrid";
import { getBlogPosts, getBlogTags } from "@/lib/blog-data";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tags = await getBlogTags();
  const tag = tags.find((item) => item.slug === slug);
  if (!tag) return { title: "Tag not found" };
  return {
    title: `${tag.name} Articles — TechTribe Blog`,
    description: tag.description || `Browse articles tagged "${tag.name}" on TechTribe.`,
    alternates: { canonical: `https://techtribe.app/blog/tag/${tag.slug}` },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [tags, posts] = await Promise.all([
    getBlogTags(),
    getBlogPosts({ tag: slug }),
  ]);
  const tag = tags.find((item) => item.slug === slug);

  if (!tag) {
    notFound();
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: "https://techtribe.app/blog" },
      { "@type": "ListItem", position: 2, name: "Tags", item: "https://techtribe.app/blog/tags" },
      { "@type": "ListItem", position: 3, name: `#${tag.name}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
            #{tag.name}
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Articles tagged with &quot;{tag.name}&quot;
          </p>
        </div>
      </div>

      <PostGrid
        posts={posts}
        variant="vertical"
        columns={3}
      />
    </div>
    </>
  );
}
