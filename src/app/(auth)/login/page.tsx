import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { PageTransition } from "@/components/motion/PageTransition";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  return (
    <PageTransition>
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <img
        alt=""
        style={{ position: "absolute", top: -40, left: -60, width: 260, height: 260, pointerEvents: "none", zIndex: 0, opacity: 0.04 }}
        src="data:image/svg+xml,%3Csvg width='479' height='480' viewBox='0 0 479 480' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M257.761 438.125C249.127 451.853 228.873 451.853 220.239 438.125L199.542 405.22C193.866 396.195 182.414 392.526 172.442 396.537L136.085 411.162C120.917 417.263 104.531 405.523 105.728 389.412L108.598 350.795C109.385 340.203 102.307 330.597 91.8492 328.062L53.7183 318.82C37.8107 314.964 31.5518 295.968 42.1231 283.629L67.4628 254.05C74.4128 245.937 74.4128 234.063 67.4628 225.95L42.1231 196.372C31.5518 184.032 37.8108 165.036 53.7183 161.18L91.8492 151.938C102.307 149.403 109.385 139.797 108.598 129.205L105.728 90.588C104.531 74.4774 120.917 62.7374 136.085 68.8386L172.442 83.4633C182.414 87.4745 193.866 83.8053 199.542 74.7802L220.239 41.8747C228.873 28.1471 249.127 28.1471 257.761 41.8747L278.458 74.7802C284.134 83.8053 295.586 87.4745 305.558 83.4633L341.915 68.8386C357.083 62.7374 373.469 74.4774 372.272 90.588L369.402 129.205C368.615 139.797 375.693 149.403 386.151 151.938L424.282 161.18C440.189 165.036 446.448 184.032 435.877 196.372L410.537 225.95C403.587 234.063 403.587 245.937 410.537 254.05L435.877 283.628C446.448 295.968 440.189 314.964 424.282 318.82L386.151 328.062C375.693 330.597 368.615 340.203 369.402 350.795L372.272 389.412C373.469 405.523 357.083 417.263 341.915 411.162L305.558 396.537C295.586 392.526 284.134 396.195 278.458 405.22L257.761 438.125Z' fill='%23D0F201'/%3E%3C/svg%3E"
      />
      <img
        alt=""
        style={{ position: "absolute", bottom: -20, right: -40, width: 200, height: 200, pointerEvents: "none", zIndex: 0, opacity: 0.03 }}
        src="data:image/svg+xml,%3Csvg width='480' height='480' viewBox='0 0 480 480' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M429.474 249.023C429.474 348.683 344.643 429.474 240 429.474C135.356 429.474 50.5263 348.683 50.5263 249.023L50.5262 122.707C50.5262 82.8425 84.4583 50.5262 126.316 50.5262C138.722 50.5262 150.433 53.3654 160.77 58.3987C166.037 60.9634 171.292 63.7747 176.569 66.598C195.142 76.5336 213.989 86.6165 234.606 86.6165H245.393C266.011 86.6165 284.858 76.5336 303.431 66.598C308.708 63.7747 313.963 60.9634 319.23 58.3987C329.567 53.3654 341.278 50.5262 353.684 50.5262C395.542 50.5262 429.474 82.8425 429.474 122.707V249.023Z' fill='%23D0F201'/%3E%3C/svg%3E"
      />
      <div className="relative z-10 w-full max-w-md pb-20">
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
    </div>
    </PageTransition>
  );
}
