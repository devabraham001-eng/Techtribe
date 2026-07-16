import { notFound } from "next/navigation";
import { ArticleView } from "@/components/blog/post/ArticleView";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog-data";
import type { Metadata } from "next";
import type { Post } from "@/types/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Article not found" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techtribe-jade.vercel.app";
  const ogImage = post.coverImageUrl || `${siteUrl}/og-default.png`;

  return {
    title: post.title,
    description: post.excerpt || post.seoDescription || `Read ${post.title} on TechTribe`,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.seoDescription || `Read ${post.title} on TechTribe`,
      url: `${siteUrl}/blog/${post.slug}`,
      siteName: "TechTribe",
      type: "article",
      publishedTime: post.publishedAt || post.createdAt,
      authors: [post.author.name],
      images: [
        {
          url: ogImage,
          alt: post.coverImageAlt || post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.seoDescription || `Read ${post.title} on TechTribe`,
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([
    getBlogPostBySlug(slug),
    getBlogPosts(),
  ]);

  if (!post) {
    notFound();
  }

  const relatedPosts = posts
    .filter(
      (candidate) =>
        candidate.slug !== slug &&
        candidate.category?.slug === post.category?.slug
    )
    .slice(0, 3);

  const currentIndex = posts.findIndex((p) => p.slug === slug);
  const prevPost: Post | null = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost: Post | null = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return <ArticleView post={post} relatedPosts={relatedPosts} prevPost={prevPost} nextPost={nextPost} />;
}
