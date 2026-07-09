import { notFound } from "next/navigation";
import { ArticleView } from "@/components/blog/post/ArticleView";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog-data";
import type { Post } from "@/types/blog";

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
