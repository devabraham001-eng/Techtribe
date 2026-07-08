import { notFound } from "next/navigation";
import { ArticleView } from "@/components/blog/post/ArticleView";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog-data";

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

  return <ArticleView post={post} relatedPosts={relatedPosts} />;
}
