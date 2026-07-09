import { getBlogPosts } from "@/lib/blog-data";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getBlogPosts();

  const items = (posts as { slug: string; title: string; excerpt?: string; publishedAt?: string; updatedAt: string; author: { name: string } }[])
    .filter((p) => p.slug && p.publishedAt)
    .map((post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>https://techtribe.app/blog/${post.slug}</link>
      <guid isPermaLink="true">https://techtribe.app/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt!).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(post.author.name)}</dc:creator>
      <description>${escapeXml(post.excerpt ?? "")}</description>
    </item>`)
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>TechTribe Blog</title>
    <link>https://techtribe.app</link>
    <description>Learn digital skills, find freelance work, share progress, and stay updated with tech news.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
