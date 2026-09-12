import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getVideoLessons } from "@/lib/learning-data";
import { VideoGuidesDashboard } from "@/components/learn/VideoGuidesDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video Guides — TechTribe",
  description: "Watch step-by-step video guides for every course on TechTribe.",
  openGraph: {
    title: "Video Guides — TechTribe",
    description: "Watch step-by-step video guides for every course on TechTribe.",
  },
};

export default async function VideoGuidesPage() {
  let userName = "Learner";
  let avatarUrl: string | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login?next=/learn/video-guides");
    }

    const authorResult = await supabase
      .from("authors")
      .select("name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();
    const authorData = (authorResult as {
      data: { name: string; avatar_url: string | null } | null;
    }).data;
    userName = authorData?.name ?? user.email ?? "Learner";
    avatarUrl = authorData?.avatar_url ?? null;
  }

  const groups = await getVideoLessons();

  return <VideoGuidesDashboard user={{ name: userName, avatarUrl }} groups={groups} />;
}
