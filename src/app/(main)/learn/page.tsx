import * as React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, Wand2, BarChart3, GitBranch, Server, Zap, Shield, GraduationCap, ArrowRight } from "lucide-react";
import { CredentialsAccordion } from "@/components/learn/CredentialsAccordion";

export const metadata: Metadata = {
  title: "Choose Your Learning Path — TechTribe",
  description: "Paths are collections of learnings designed to build deep skills in a particular area. Whether you're looking to earn achievements, build a collection of skill badges, or prepare for a certification, there are paths right for you.",
  openGraph: {
    title: "Choose Your Learning Path — TechTribe",
    description: "Build real-world skills with structured learning paths.",
  },
};

const demoPaths = [
  { id: "1", title: "Web Development Fundamentals", slug: "web-development-fundamentals", lessons: 12 },
  { id: "2", title: "React & Modern Frontend", slug: "react-modern-frontend", lessons: 18 },
  { id: "3", title: "Backend Engineering with Node.js", slug: "backend-engineering-nodejs", lessons: 14 },
  { id: "4", title: "Python & Data Science", slug: "python-data-science", lessons: 16 },
  { id: "5", title: "DevOps & Cloud Infrastructure", slug: "devops-cloud-infrastructure", lessons: 20 },
  { id: "6", title: "Mobile Development with React Native", slug: "mobile-react-native", lessons: 15 },
];

export default async function LearnPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ===== PAGE HEADER (breadcrumb + free trial, outside paths-wrapper) ===== */}
      <div className="page-header">
        <div className="page-main-banner" style={{ background: "transparent" }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="breadcrumbs-container" role="navigation">
              <ol className="flex items-center gap-1.5 text-xs sm:text-sm" style={{ color: "#636366" }}>
                <li className="breadcrumb-item flex items-center gap-1.5">
                  <Link href="/" className="hover:opacity-70 transition-opacity" aria-label="Home">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </Link>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </li>
                <li className="breadcrumb-item" tabIndex={0} style={{ color: "#98989d" }}>
                  Paths
                </li>
              </ol>
            </nav>

            {/* Free trial banner */}
            <aside aria-label="Free trial" className="console-free-trial mt-4 sm:mt-5">
              <div className="flex flex-wrap items-center gap-3 rounded-xl border p-4 sm:p-5" style={{ borderColor: "#D0F201", background: "rgba(208, 242, 1, 0.04)" }}>
                <p className="text-sm sm:text-base flex-1" style={{ color: "#f5f5f7" }}>
                  Apply your skills in real projects.
                </p>
                <div className="console-free-trial-actions flex-shrink-0">
                  <Link
                    href="/learn"
                    className="elevated inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: "#D0F201", color: "#10180B" }}
                  >
                    Get started
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ===== PATHS WRAPPER ===== */}
      <div className="paths-wrapper" style={{ position: "relative" }}>
        {/* ---- Shape top (hexagon/blob) ---- */}
        <img
          alt=""
          className="paths-shape paths-shape-top-full"
          style={{ position: "absolute", top: -60, right: -80, width: 400, height: 400, pointerEvents: "none", zIndex: 0, opacity: 0.04 }}
          src="data:image/svg+xml,%3Csvg width='800' height='800' viewBox='0 0 800 800' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M350.94 83.8859C352.08 82.7698 352.649 82.2118 353.143 81.7469C379.465 56.9615 420.536 56.9615 446.857 81.7469C447.351 82.2118 447.921 82.7698 449.06 83.8859C449.743 84.5556 450.085 84.8905 450.41 85.2005C467.253 101.275 491.12 107.67 513.744 102.171C514.18 102.065 514.643 101.946 515.57 101.707C517.115 101.31 517.887 101.112 518.547 100.956C553.735 92.6522 589.304 113.188 599.706 147.813C599.901 148.463 600.116 149.231 600.544 150.767C600.801 151.689 600.93 152.15 601.056 152.581C607.605 174.923 625.077 192.395 647.42 198.944C647.85 199.07 648.311 199.199 649.233 199.456C650.769 199.885 651.537 200.099 652.187 200.294C686.812 210.696 707.348 246.265 699.044 281.453C698.888 282.113 698.69 282.885 698.293 284.43C698.054 285.357 697.935 285.82 697.829 286.256C692.33 308.88 698.725 332.747 714.8 349.59C715.11 349.915 715.444 350.257 716.114 350.94C717.23 352.079 717.788 352.649 718.253 353.143C743.039 379.464 743.039 420.535 718.253 446.857C717.788 447.351 717.23 447.92 716.114 449.06C715.444 449.743 715.11 450.085 714.8 450.41C698.725 467.253 692.33 491.12 697.829 513.744C697.935 514.18 698.054 514.643 698.293 515.57C698.69 517.115 698.888 517.887 699.044 518.547C707.348 553.735 686.812 589.303 652.187 599.706C651.537 599.901 650.769 600.115 649.233 600.544C648.311 600.801 647.85 600.93 647.419 601.056C625.077 607.605 607.605 625.077 601.056 647.419C600.93 647.85 600.801 648.311 600.544 649.233C600.116 650.769 599.901 651.537 599.706 652.186C589.304 686.812 553.735 707.348 518.547 699.044C517.887 698.888 517.115 698.69 515.57 698.293C514.643 698.054 514.18 697.935 513.744 697.829C491.12 692.33 467.253 698.725 450.41 714.799C450.085 715.109 449.743 715.444 449.06 716.114C447.921 717.23 447.351 717.788 446.857 718.253C420.536 743.038 379.465 743.038 353.143 718.253C352.649 717.788 352.08 717.23 350.94 716.114C350.257 715.444 349.915 715.109 349.59 714.799C332.747 698.725 308.88 692.33 286.256 697.829C285.82 697.935 285.357 698.054 284.43 698.293C282.885 698.69 282.113 698.888 281.453 699.044C246.265 707.348 210.697 686.812 200.294 652.186C200.099 651.537 199.885 650.769 199.456 649.233C199.199 648.311 199.071 647.85 198.944 647.419C192.395 625.077 174.923 607.605 152.581 601.056C152.15 600.93 151.689 600.801 150.767 600.544C149.231 600.115 148.463 599.901 147.814 599.706C113.188 589.303 92.6523 553.735 100.956 518.547C101.112 517.887 101.31 517.115 101.707 515.57C101.946 514.643 102.065 514.18 102.171 513.744C107.67 491.12 101.275 467.253 85.2006 450.41C84.8906 450.085 84.5557 449.743 83.886 449.06C82.7699 447.92 82.2119 447.351 81.7471 446.857C56.9616 420.535 56.9616 379.464 81.7471 353.143C82.2119 352.649 82.7699 352.079 83.886 350.94C84.5557 350.257 84.8906 349.915 85.2006 349.59C101.275 332.747 107.67 308.88 102.171 286.256C102.065 285.82 101.946 285.357 101.707 284.43C101.31 282.885 101.112 282.113 100.956 281.453C92.6523 246.265 113.188 210.696 147.814 200.294C148.463 200.099 149.231 199.885 150.767 199.456C151.689 199.199 152.15 199.07 152.581 198.944C174.923 192.395 192.395 174.923 198.944 152.581C199.071 152.15 199.199 151.689 199.456 150.767C199.885 149.231 200.099 148.463 200.294 147.813C210.697 113.188 246.265 92.6522 281.453 100.956C282.113 101.112 282.885 101.31 284.43 101.707C285.357 101.946 285.82 102.065 286.256 102.171C308.88 107.67 332.747 101.275 349.59 85.2005C349.915 84.8905 350.257 84.5556 350.94 83.8859Z' fill='%23D0F201'/%3E%3C/svg%3E"
        />

        {/* ---- Shape middle (star) ---- */}
        <img
          alt=""
          className="paths-shape paths-shape-middle"
          style={{ position: "absolute", top: 380, left: -40, width: 240, height: 240, pointerEvents: "none", zIndex: 0, opacity: 0.035 }}
          src="data:image/svg+xml,%3Csvg width='479' height='480' viewBox='0 0 479 480' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M257.761 438.125C249.127 451.853 228.873 451.853 220.239 438.125L199.542 405.22C193.866 396.195 182.414 392.526 172.442 396.537L136.085 411.162C120.917 417.263 104.531 405.523 105.728 389.412L108.598 350.795C109.385 340.203 102.307 330.597 91.8492 328.062L53.7183 318.82C37.8107 314.964 31.5518 295.968 42.1231 283.629L67.4628 254.05C74.4128 245.937 74.4128 234.063 67.4628 225.95L42.1231 196.372C31.5518 184.032 37.8108 165.036 53.7183 161.18L91.8492 151.938C102.307 149.403 109.385 139.797 108.598 129.205L105.728 90.588C104.531 74.4774 120.917 62.7374 136.085 68.8386L172.442 83.4633C182.414 87.4745 193.866 83.8053 199.542 74.7802L220.239 41.8747C228.873 28.1471 249.127 28.1471 257.761 41.8747L278.458 74.7802C284.134 83.8053 295.586 87.4745 305.558 83.4633L341.915 68.8386C357.083 62.7374 373.469 74.4774 372.272 90.588L369.402 129.205C368.615 139.797 375.693 149.403 386.151 151.938L424.282 161.18C440.189 165.036 446.448 184.032 435.877 196.372L410.537 225.95C403.587 234.063 403.587 245.937 410.537 254.05L435.877 283.628C446.448 295.968 440.189 314.964 424.282 318.82L386.151 328.062C375.693 330.597 368.615 340.203 369.402 350.795L372.272 389.412C373.469 405.523 357.083 417.263 341.915 411.162L305.558 396.537C295.586 392.526 284.134 396.195 278.458 405.22L257.761 438.125Z' fill='%23D0F201'/%3E%3C/svg%3E"
        />

        {/* ---- Shape bottom (badge) ---- */}
        <img
          alt=""
          className="paths-shape paths-shape-bottom"
          style={{ position: "absolute", bottom: 320, right: -30, width: 200, height: 200, pointerEvents: "none", zIndex: 0, opacity: 0.03 }}
          src="data:image/svg+xml,%3Csvg width='480' height='480' viewBox='0 0 480 480' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M429.474 249.023C429.474 348.683 344.643 429.474 240 429.474C135.356 429.474 50.5263 348.683 50.5263 249.023L50.5262 122.707C50.5262 82.8425 84.4583 50.5262 126.316 50.5262C138.722 50.5262 150.433 53.3654 160.77 58.3987C166.037 60.9634 171.292 63.7747 176.569 66.598C195.142 76.5336 213.989 86.6165 234.606 86.6165H245.393C266.011 86.6165 284.858 76.5336 303.431 66.598C308.708 63.7747 313.963 60.9634 319.23 58.3987C329.567 53.3654 341.278 50.5262 353.684 50.5262C395.542 50.5262 429.474 82.8425 429.474 122.707V249.023Z' fill='%23D0F201'/%3E%3C/svg%3E"
        />

        {/* ===== INTRO ===== */}
        <section className="paths-intro" style={{ position: "relative", zIndex: 1 }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6 text-center">
            <h2 className="paths-headline font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mx-auto" style={{ maxWidth: 720 }}>
              Shape <strong className="text-primary">your future</strong> self
            </h2>
            <p className="paths-description mt-4 text-base sm:text-lg leading-relaxed mx-auto" style={{ color: "#98989d", maxWidth: 680 }}>
              Paths are collections of learnings designed to build deep skills in a particular area.
              Whether you&apos;re looking to earn achievements, build a collection of skill badges,
              or prepare for a certification, there are paths right for you. When you&apos;re done,
              share your accomplishments on social media and hiring platforms like LinkedIn and Credly.
            </p>
          </div>
        </section>

        {/* ===== CATEGORIES ===== */}
        <section className="paths-categories" style={{ position: "relative", zIndex: 1 }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-6">
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { id: "ai", label: "AI / ML", icon: Sparkles },
                { id: "agents", label: "Agents", icon: Wand2 },
                { id: "data", label: "Data", icon: BarChart3 },
                { id: "devtools", label: "Dev Tools", icon: GitBranch },
                { id: "infrastructure", label: "Infrastructure", icon: Server },
                { id: "productivity", label: "Productivity", icon: Zap },
                { id: "security", label: "Security", icon: Shield },
              ].map((cat) => {
                const Icon = cat.icon;
                return (
                  <a key={cat.id} href={`/learn?category=${cat.id}`} style={{ textDecoration: "none" }}>
                    <div className="category-block flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all hover:bg-white/[0.03]" style={{ background: "transparent" }}>
                      <Icon className="category-icon h-5 w-5" style={{ color: "#D0F201" }} />
                      <p className="category-title text-sm font-medium" style={{ color: "#f5f5f7" }}>{cat.label}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== PATHS LIST ===== */}
        <section className="paths-list" style={{ position: "relative", zIndex: 1 }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="paths-grid">
              {demoPaths.map((track) => (
                <a
                  key={track.id}
                  href={`/learn/${track.slug}`}
                  className="path-card"
                  aria-label={`Path: ${track.title}, ${track.lessons} lessons`}
                >
                  <div className="path-card__content">
                    <div className="path-card__badge">
                      <GraduationCap className="path-card__icon" aria-hidden="true" />
                      <span className="path-card__type">Path</span>
                    </div>
                    <h3 className="path-card__title">{track.title}</h3>
                    <p className="path-card__metadata">{track.lessons} lesson{track.lessons !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="path-card__action" aria-hidden="true">
                    <ArrowRight />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <style>{`
          .paths-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-width: 800px;
            margin: 0 auto;
          }

          .path-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px;
            background-color: #1c1c1e;
            border: 1px solid #38383a;
            border-radius: 16px;
            text-decoration: none;
            color: #f5f5f7;
            transition: all 0.2s ease-in-out;
            width: 100%;
            max-width: 800px;
            box-sizing: border-box;
          }

          .path-card:hover {
            border-color: #4a4a4c;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            background-color: #222224;
          }

          .path-card__content {
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex-grow: 1;
          }

          .path-card__badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #98989d;
            font-size: 14px;
            font-weight: 500;
          }

          .path-card__icon {
            width: 18px;
            height: 18px;
          }

          .path-card__title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            line-height: 1.4;
            color: #f5f5f7;
          }

          .path-card__metadata {
            margin: 0;
            font-size: 14px;
            color: #70757a;
          }

          .path-card__action {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #D0F201;
            padding-left: 16px;
            transition: transform 0.2s ease;
            width: 20px;
            height: 20px;
          }

          .path-card:hover .path-card__action {
            transform: translateX(4px);
          }
        `}</style>

        {/* ===== EXPLORE ===== */}
        <section className="explore text-center pb-16" style={{ position: "relative", zIndex: 1 }}>
          <a
            href="/learn"
            className="inline-flex items-center rounded-lg border px-5 py-2.5 text-sm font-medium transition-all hover:bg-card"
            style={{ borderColor: "#38383a", color: "#f5f5f7", textDecoration: "none" }}
          >
            Explore more paths
          </a>
        </section>

        {/* ===== CREDENTIALS ===== */}
        <section className="credentials" style={{ position: "relative", zIndex: 1 }}>
          <section className="guest-front-door-block multi-msg-body" id="get-credentialed" tabIndex={0}>
            <div style={{ background: "#141416" }}>
              <div className="border-y" style={{ borderColor: "#38383a" }}>
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                  <div className="multi-msg-body__header text-center max-w-2xl mx-auto mb-12">
                    <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                      Which credential is right for you?
                    </h2>
                    <p className="mt-3 text-base" style={{ color: "#98989d" }}>
                      Certifications can be a big step, and a big investment. Need to build your skills first?
                      Explore our Skill Badges and Certificates.
                    </p>
                  </div>
                  <CredentialsAccordion />
                </div>
              </div>
            </div>
          </section>
        </section>

        {/* ===== CONTINUE (CTA) ===== */}
        <section className="continue" id="animated-paths-footer" style={{ position: "relative", zIndex: 1 }}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center relative">
            {/* continue decorative shape */}
            <div className="continue-img flex justify-center mb-6" style={{ opacity: 0.15 }}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M55.2468 22.0856C53.308 19.0091 51.3348 15.89 48.7135 13.4471C46.0921 10.9981 42.6964 9.26796 39.2147 9.49336C36.1574 9.6944 33.3238 11.388 31.0868 13.5994C28.8497 15.8108 27.1117 18.5339 25.4024 21.2327C20.7792 28.5188 16.1502 35.8049 11.527 43.097C9.33014 46.5573 7.07589 50.1699 6.46788 54.2942C5.73367 59.2775 7.71259 64.3521 11.223 67.6662C14.8941 71.1325 20.8423 70.8523 25.3106 69.902C30.2092 68.8602 34.9987 66.8986 39.9948 66.9047C44.2738 66.9047 48.4095 68.3546 52.5738 69.4085C56.7324 70.4563 61.2008 71.1021 65.216 69.5425C70.2005 67.6114 73.7798 62.1224 73.6823 56.4873C73.5905 51.3456 68.1069 42.4756 68.1069 42.4756C68.1069 42.4756 59.5326 28.8828 55.2468 22.0856Z" fill="#D0F201" />
              </svg>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Continue your learning journey
            </h2>
            <p className="continue-description mt-4 text-base sm:text-lg max-w-lg mx-auto" style={{ color: "#98989d" }}>
              Track your learning progress, check out featured content, and celebrate your achievements.
            </p>
            <a
              href="/dashboard"
              className="mt-8 inline-flex items-center rounded-lg border px-6 py-3 text-sm font-semibold transition-all hover:bg-card"
              style={{ borderColor: "#38383a", color: "#f5f5f7", textDecoration: "none" }}
            >
              Visit dashboard
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
