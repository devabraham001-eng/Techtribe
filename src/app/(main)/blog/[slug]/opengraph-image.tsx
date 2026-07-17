import { ImageResponse } from "next/og";

export const runtime = "edge";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let title = "";
  let authorName = "";
  let categoryName = "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/posts?select=title,author:author_id(name),category:category_id(name)&slug=eq.${slug}&limit=1`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      const posts = await res.json() as { title: string; author: { name: string }[]; category: { name: string }[] }[];
      const post = posts[0];
      if (post) {
        title = post.title;
        authorName = post.author?.[0]?.name ?? "";
        categoryName = post.category?.[0]?.name ?? "";
      }
    } catch {
      // fallback below
    }
  }

  if (!title) {
    title = "TechTribe Blog";
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0a0a0b 0%, #1a1a2e 50%, #16213e 100%)",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "auto" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            T
          </div>
          <span style={{ color: "#a1a1aa", fontSize: 20, fontWeight: 500 }}>TechTribe</span>
        </div>

        {categoryName && (
          <div
            style={{
              display: "flex",
              color: "#a78bfa",
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {categoryName}
          </div>
        )}

        <h1
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#fafafa",
            lineHeight: 1.15,
            maxWidth: 900,
            margin: 0,
            marginBottom: 24,
          }}
        >
          {title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: "auto" }}>
          {authorName && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#d4d4d8",
                fontSize: 20,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {authorName.charAt(0)}
              </div>
              <span>{authorName}</span>
            </div>
          )}

          <div style={{ flex: 1 }} />

          <div
            style={{
              display: "flex",
              gap: 8,
              color: "#71717a",
              fontSize: 16,
            }}
          >
Blog
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
