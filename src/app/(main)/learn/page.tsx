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

  let dashboardProps: DashboardProps | null = null;
  let isAuthenticated = false;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      isAuthenticated = false;
    } else {
      isAuthenticated = true;

      const [authorRes, progressRes, lessonsForTable, tracksRes, challengeRes, mentorsRes] = await Promise.all([
        supabase.from("authors").select("id, name, avatar_url").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_lesson_progress").select("id, completed_at, submitted_project_article_id").eq("user_id", user.id),
        supabase.from("user_lesson_progress").select("id, completed_at, lesson:lessons!inner(id, title, is_project, module:track_modules!inner(id, track_id, title, track:learning_tracks!inner(id, title, slug, category, cover_image_url)))").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(5),
        supabase.from("learning_tracks").select("id, lesson_count"),
        supabase.from("user_challenge_submissions").select("id, passed").eq("user_id", user.id),
        supabase.from("authors").select("id, name, avatar_url, bio, status").eq("is_staff", true),
      ]);

      const authorData = authorRes.data as { id: string; name: string; avatar_url: string | null } | null;
      const userName = authorData?.name ?? user.email ?? "User";
      const firstName = userName.split(" ")[0];
      const userAvatarUrl = authorData?.avatar_url ?? null;

      const progressRows = (progressRes.data ?? []) as { id: string; completed_at: string; submitted_project_article_id: string | null }[];
      const completedLessons = progressRows.length;
      const projectsSubmitted = progressRows.filter((p) => p.submitted_project_article_id != null).length;

      const totalLessons = (tracksRes.data ?? []).reduce(
        (sum: number, t: { lesson_count: number | null }) => sum + (t.lesson_count ?? 0),
        0
      );

      const challengeRows = (challengeRes.data ?? []) as { id: string; passed: boolean }[];
      const challengesPassed = challengeRows.filter((c) => c.passed).length;

      const completedDates = progressRows.map((p) => p.completed_at.split("T")[0]);
      const streak = computeStreak(completedDates);

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
