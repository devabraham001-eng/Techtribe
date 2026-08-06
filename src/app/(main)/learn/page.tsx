import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LearnPageContent } from "./LearnPageContent";
import { LearnDashboard } from "@/components/learn/LearnDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Learning — TechTribe",
  description: "Build real-world skills with structured learning paths and track your progress.",
  openGraph: {
    title: "Learning — TechTribe",
    description: "Build real-world skills with structured learning paths.",
  },
};

function computeStreak(dates: string[]): number {
  const unique = [...new Set(dates)].sort().reverse();
  if (unique.length === 0) return 0;
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const yesterdayDate = new Date(now.getTime() - 86400000);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

  let startDate: string | null = null;
  if (unique[0] === todayStr) startDate = todayStr;
  else if (unique[0] === yesterdayStr) startDate = yesterdayStr;
  if (!startDate) return 0;

  let streak = 0;
  let checkDate: string = startDate;
  for (const date of unique) {
    if (date === checkDate) {
      streak++;
      const d = new Date(checkDate + "T12:00:00Z");
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split("T")[0];
    } else if (date < checkDate) {
      break;
    }
  }
  return streak;
}

export default async function LearnPage() {
  if (!isSupabaseConfigured()) {
    return <LearnPageContent />;
  }

  type DashboardProps = {
    user: { name: string; avatarUrl: string | null; firstName: string };
    stats: { completedLessons: number; totalLessons: number; projectsSubmitted: number; challengesPassed: number; streak: number };
    trackProgress: Array<{ id: string; title: string; slug: string; category: string | null; coverImageUrl: string | null; totalLessons: number; completedLessons: number }>;
    continueWatching: Array<{ id: string; lessonTitle: string; trackTitle: string; trackSlug: string; trackCategory: string | null; coverImageUrl: string | null }>;
    activityData: Array<{ period: string; count: number }>;
    recentLessons: Array<{ id: string; completedAt: string; lesson: { id: string; title: string; isProject: boolean; track: { id: string; title: string; slug: string; category: string | null; coverImageUrl: string | null } } }>;
    mentors: Array<{ id: string; name: string; avatarUrl: string | null; bio: string | null; status: string | null }>;
  };

  type NestedLessonRow = {
    id: string;
    completed_at: string;
    lesson: {
      id: string;
      title: string;
      is_project: boolean;
      module: {
        id: string;
        track_id: string;
        title: string;
        track: {
          id: string;
          title: string;
          slug: string;
          category: string | null;
          cover_image_url: string | null;
        };
      };
    };
  };

  type ProgressRow = {
    id: string;
    lesson_id: string;
    completed_at: string;
    submitted_project_article_id: string | null;
  };

  type TrackRow = { id: string; title: string; slug: string; category: string | null; cover_image_url: string | null; lesson_count: number | null };
  type LessonRow = { id: string; module_id: string };
  type TrackModuleRow = { id: string; track_id: string };

  let dashboardProps: DashboardProps | null = null;
  let isAuthenticated = false;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      isAuthenticated = false;
    } else {
      isAuthenticated = true;

      const [authorRes, progressRes, lessonsForTable, tracksRes, modulesRes, allLessonsRes, challengeRes, mentorsRes] = await Promise.all([
        supabase.from("authors").select("id, name, avatar_url").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_lesson_progress").select("id, lesson_id, completed_at, submitted_project_article_id").eq("user_id", user.id),
        supabase.from("user_lesson_progress").select("id, completed_at, lesson:lessons!inner(id, title, is_project, module:track_modules!inner(id, track_id, title, track:learning_tracks!inner(id, title, slug, category, cover_image_url)))").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(5),
        supabase.from("learning_tracks").select("id, title, slug, category, cover_image_url, lesson_count"),
        supabase.from("track_modules").select("id, track_id"),
        supabase.from("lessons").select("id, module_id"),
        supabase.from("user_challenge_submissions").select("id, passed").eq("user_id", user.id),
        supabase.from("authors").select("id, name, avatar_url, bio, status").eq("is_staff", true),
      ]);

      const authorData = authorRes.data as { id: string; name: string; avatar_url: string | null } | null;
      const userName = authorData?.name ?? user.email ?? "User";
      const firstName = userName.split(" ")[0];
      const userAvatarUrl = authorData?.avatar_url ?? null;

      const progressRows = (progressRes.data ?? []) as ProgressRow[];
      const completedLessons = progressRows.length;
      const projectsSubmitted = progressRows.filter((p) => p.submitted_project_article_id != null).length;

      const tracks = (tracksRes.data ?? []) as TrackRow[];
      const totalLessons = tracks.reduce((sum: number, t: TrackRow) => sum + (t.lesson_count ?? 0), 0);

      const challengeRows = (challengeRes.data ?? []) as { id: string; passed: boolean }[];
      const challengesPassed = challengeRows.filter((c) => c.passed).length;

      const completedDates = progressRows.map((p) => p.completed_at.split("T")[0]);
      const streak = computeStreak(completedDates);

      // Build module → track mapping
      const modules = (modulesRes.data ?? []) as TrackModuleRow[];
      const moduleToTrack = new Map<string, string>();
      for (const m of modules) moduleToTrack.set(m.id, m.track_id);

      // Get all lesson IDs completed by user and map to tracks
      const allLessons = (allLessonsRes.data ?? []) as LessonRow[];
      const lessonToModule = new Map<string, string>();
      for (const l of allLessons) lessonToModule.set(l.id, l.module_id);

      // Count completed per track using full progress data
      const trackCompletedCounts = new Map<string, number>();
      for (const p of progressRows) {
        const moduleId = lessonToModule.get(p.lesson_id);
        if (moduleId) {
          const trackId = moduleToTrack.get(moduleId);
          if (trackId) {
            trackCompletedCounts.set(trackId, (trackCompletedCounts.get(trackId) ?? 0) + 1);
          }
        }
      }

      const trackProgress = tracks.map((t) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        category: t.category,
        coverImageUrl: t.cover_image_url,
        totalLessons: t.lesson_count ?? 0,
        completedLessons: trackCompletedCounts.get(t.id) ?? 0,
      }));

      // Continue watching: tracks where started but not finished
      const inProgressTracks = trackProgress
        .filter((t) => t.completedLessons > 0 && t.completedLessons < t.totalLessons)
        .slice(0, 3);

      // For continue watching, use the most recent completed lesson from each in-progress track
      const nestedProgress = (lessonsForTable.data as unknown as NestedLessonRow[] ?? []);
      const continueWatching = inProgressTracks.map((t) => {
        const recentInTrack = nestedProgress.find((r) => r.lesson.module.track.id === t.id);
        return {
          id: recentInTrack?.id ?? t.id,
          lessonTitle: recentInTrack?.lesson.title ?? t.title,
          trackTitle: t.title,
          trackSlug: t.slug,
          trackCategory: t.category,
          coverImageUrl: t.coverImageUrl,
        };
      });

      // Activity data: group completed lessons by 10-day periods in the current month
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const activityData = [
        { period: "1-10", count: 0 },
        { period: "11-20", count: 0 },
        { period: "21-31", count: 0 },
      ];
      for (const p of progressRows) {
        const d = new Date(p.completed_at);
        if (d.getFullYear() === year && d.getMonth() === month) {
          const day = d.getDate();
          if (day <= 10) activityData[0].count++;
          else if (day <= 20) activityData[1].count++;
          else activityData[2].count++;
        }
      }

      const recentLessons = (lessonsForTable.data as unknown as NestedLessonRow[] ?? []).map((row) => {
        const lesson = row.lesson;
        return {
          id: row.id,
          completedAt: row.completed_at,
          lesson: {
            id: lesson.id,
            title: lesson.title,
            isProject: lesson.is_project,
            track: {
              id: lesson.module.track.id,
              title: lesson.module.track.title,
              slug: lesson.module.track.slug,
              category: lesson.module.track.category,
              coverImageUrl: lesson.module.track.cover_image_url,
            },
          },
        };
      });

      const mentorRows = (mentorsRes.data ?? [])
        .filter((m: { id: string }) => m.id !== authorData?.id)
        .slice(0, 6) as {
          id: string;
          name: string;
          avatar_url: string | null;
          bio: string | null;
          status: string | null;
        }[];

      dashboardProps = {
        user: { name: userName, avatarUrl: userAvatarUrl, firstName },
        stats: { completedLessons, totalLessons, projectsSubmitted, challengesPassed, streak },
        trackProgress,
        continueWatching,
        activityData,
        recentLessons,
        mentors: mentorRows.map((m) => ({
          id: m.id,
          name: m.name,
          avatarUrl: m.avatar_url,
          bio: m.bio,
          status: m.status,
        })),
      };
    }
  } catch {
    isAuthenticated = false;
  }

  if (!isAuthenticated || !dashboardProps) {
    return <LearnPageContent />;
  }

  return <LearnDashboard {...dashboardProps} />;
}
