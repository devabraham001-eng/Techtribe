import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, ExternalLink } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getVideoWatchData } from "@/lib/learning-data";
import { VideoPlayer } from "@/components/learn/VideoGuidesDashboard";

export const dynamic = "force-dynamic";

interface WatchParams {
  params: Promise<{ lessonId: string }>;
}

export async function generateMetadata({ params }: WatchParams): Promise<Metadata> {
  const { lessonId } = await params;
  const data = await getVideoWatchData(lessonId);
  if (!data) return { title: "Video not found — TechTribe" };
  return {
    title: `${data.current.title} — TechTribe Video Guides`,
    description: `Watch "${data.current.title}" from ${data.current.trackTitle}.`,
  };
}

export default async function VideoWatchPage({ params }: WatchParams) {
  const { lessonId } = await params;

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect(`/login?next=/learn/video-guides/watch/${lessonId}`);
    }
  }

  const data = await getVideoWatchData(lessonId);
  if (!data) notFound();

  const { current, prev, next } = data;

  return (
    <div className="space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <Link
          href="/learn/video-guides"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> All videos
        </Link>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              {current.category} ·{" "}
              <Link href={`/learn/${current.trackSlug}`} className="text-primary hover:underline">
                {current.trackTitle}
              </Link>
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {current.title}
            </h1>
          </div>
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
            <VideoPlayer title={current.title} videoUrl={current.videoUrl} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={current.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-card-hover hover:text-foreground"
            >
              Open original <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/learn/video-guides/watch/${prev.lessonId}`}
              className="group flex items-center gap-2 rounded-2xl border border-border bg-card p-4 transition hover:bg-card-hover"
            >
              <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-[11px] font-medium text-muted-foreground">Previous</span>
                <span className="block truncate text-sm font-semibold text-foreground">{prev.title}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/learn/video-guides/watch/${next.lessonId}`}
              className="group flex items-center justify-end gap-2 rounded-2xl border border-border bg-card p-4 text-right transition hover:bg-card-hover"
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-medium text-muted-foreground">Up next</span>
                <span className="block truncate text-sm font-semibold text-foreground">{next.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
  );
}
