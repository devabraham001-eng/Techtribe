import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPortfolioData } from "@/lib/portfolio-data";
import { PortfolioView } from "@/components/practice/PortfolioView";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techtribe.online";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const data = await getPortfolioData(username);
  if (!data?.author) return { title: "Profile not found" };
  return {
    title: `${data.author.name} — TechTribe Portfolio`,
    description: data.author.bio || `View ${data.author.name}'s proof of work on TechTribe.`,
    openGraph: {
      title: `${data.author.name} — TechTribe Portfolio`,
      description: data.author.bio || `View ${data.author.name}'s proof of work on TechTribe.`,
      images: data.author.avatarUrl ? [{ url: data.author.avatarUrl }] : [],
    },
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getPortfolioData(username);
  if (!data || !data.author) notFound();
  return <PortfolioView data={{ ...data, author: data.author }} />;
}
