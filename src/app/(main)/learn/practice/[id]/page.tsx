import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWorkloadById } from "@/lib/practice-data";
import { WorkloadPageContent } from "./WorkloadPageContent";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techtribe.online";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const workload = await getWorkloadById(id);
  if (!workload) return { title: "Workload not found" };
  return {
    title: `${workload.title} — Practice`,
    description: workload.brief.slice(0, 160),
    alternates: { canonical: `${siteUrl}/learn/practice/${workload.id}` },
    openGraph: {
      title: `${workload.title} — TechTribe Practice`,
      description: workload.brief.slice(0, 160),
    },
  };
}

export default async function WorkloadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workload = await getWorkloadById(id);
  if (!workload) notFound();
  return <WorkloadPageContent workload={workload} />;
}
