import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md px-6 pb-20">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold">Write for TechTribe</h1>
      <p className="mb-8 mt-2 text-sm text-muted-foreground">
        Sign in to create drafts and publish articles.
      </p>
      <Suspense fallback={null}>
        <LoginForm configured={isSupabaseConfigured()} />
      </Suspense>
    </div>
  );
}
