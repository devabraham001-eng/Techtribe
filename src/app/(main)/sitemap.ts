import { MetadataRoute } from "next";
import { getBlogPosts, getBlogCategories, getBlogAuthors, getBlogTags } from "@/lib/blog-data";
import { getLearningTracks } from "@/lib/learning-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, authors, tags, tracks] = await Promise.all([
    getBlogPosts().catch(() => [] as never[]),
    getBlogCategories().catch(() => [] as never[]),
    getBlogAuthors().catch(() => [] as never[]),
    getBlogTags().catch(() => [] as never[]),
    getLearningTracks().catch(() => [] as never[]),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: "https://techtribe.app", changeFrequency: "weekly", priority: 1 },
    { url: "https://techtribe.app/blog", changeFrequency: "daily", priority: 0.9 },
    { url: "https://techtribe.app/learn", changeFrequency: "daily", priority: 0.9 },
    { url: "https://techtribe.app/blog/authors", changeFrequency: "weekly", priority: 0.5 },
    { url: "https://techtribe.app/blog/categories", changeFrequency: "weekly", priority: 0.5 },
    { url: "https://techtribe.app/blog/tags", changeFrequency: "weekly", priority: 0.5 },
    { url: "https://techtribe.app/blog/search", changeFrequency: "weekly", priority: 0.3 },
    { url: "https://techtribe.app/login", changeFrequency: "yearly", priority: 0.1 },
  ];

  const postRoutes: MetadataRoute.Sitemap = (posts as { slug: string; updatedAt: string }[])
    .filter((p) => p.slug)
    .map((post) => ({
      url: `https://techtribe.app/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const categoryRoutes: MetadataRoute.Sitemap = (categories as { slug: string }[])
    .filter((c) => c.slug)
    .map((category) => ({
      url: `https://techtribe.app/blog/category/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const authorRoutes: MetadataRoute.Sitemap = (authors as { slug: string }[])
    .filter((a) => a.slug)
    .map((author) => ({
      url: `https://techtribe.app/blog/author/${author.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const tagRoutes: MetadataRoute.Sitemap = (tags as { slug: string }[])
    .filter((t) => t.slug)
    .map((tag) => ({
      url: `https://techtribe.app/blog/tag/${tag.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

  const trackRoutes: MetadataRoute.Sitemap = (tracks as { slug: string }[])
    .filter((t) => t.slug)
    .map((track) => ({
      url: `https://techtribe.app/learn/${track.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...postRoutes, ...categoryRoutes, ...authorRoutes, ...tagRoutes, ...trackRoutes];
}
