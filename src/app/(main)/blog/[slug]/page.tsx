import { notFound } from "next/navigation";
import { ArticleView } from "@/components/blog/post/ArticleView";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog-data";
import type { Metadata } from "next";
import type { Post } from "@/types/blog";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techtribe.app";

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

  const ogImage = post.coverImageUrl || `${siteUrl}/blog/${post.slug}/opengraph-image`;

  return {
    title: post.title,
    description: post.excerpt || post.seoDescription || `Read ${post.title} on TechTribe`,
    authors: [{ name: post.author.name, url: `${siteUrl}/blog/author/${post.author.slug}` }],
    keywords: [...post.tags.map((t) => t.name), ...(post.category?.name ? [post.category.name] : [])],
    alternates: {
      canonical: post.canonicalUrl || `${siteUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.seoDescription || `Read ${post.title} on TechTribe`,
      url: `${siteUrl}/blog/${post.slug}`,
      siteName: "TechTribe",
      type: "article",
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags.map((t) => t.name),
      images: [
        {
          url: ogImage,
          alt: post.coverImageAlt || post.title,
          width: 1200,
          height: 630,
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

function jsonLd(post: Post) {
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.seoDescription,
    url: postUrl,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: `${siteUrl}/blog/author/${post.author.slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: "TechTribe",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/ttlg.png`,
      },
    },
    image: post.coverImageUrl || `${siteUrl}/blog/${post.slug}/opengraph-image`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(post)) }}
      />
      <ArticleView post={post} relatedPosts={relatedPosts} prevPost={prevPost} nextPost={nextPost} />
    </>
  );
}
