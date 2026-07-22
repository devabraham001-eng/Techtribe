import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex justify-center">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M55.2468 22.0856C53.308 19.0091 51.3348 15.89 48.7135 13.4471C46.0921 10.9981 42.6964 9.26796 39.2147 9.49336C36.1574 9.6944 33.3238 11.388 31.0868 13.5994C28.8497 15.8108 27.1117 18.5339 25.4024 21.2327C20.7792 28.5188 16.1502 35.8049 11.527 43.097C9.33014 46.5573 7.07589 50.1699 6.46788 54.2942C5.73367 59.2775 7.71259 64.3521 11.223 67.6662C14.8941 71.1325 20.8423 70.8523 25.3106 69.902C30.2092 68.8602 34.9987 66.8986 39.9948 66.9047C44.2738 66.9047 48.4095 68.3546 52.5738 69.4085C56.7324 70.4563 61.2008 71.1021 65.216 69.5425C70.2005 67.6114 73.7798 62.1224 73.6823 56.4873C73.5905 51.3456 68.1069 42.4756 68.1069 42.4756C68.1069 42.4756 59.5326 28.8828 55.2468 22.0856Z" fill="#D0F201" opacity="0.3" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Page not ready yet
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mb-8 leading-relaxed">
          This page is still under construction. We&apos;re working on it and it&apos;ll be live soon.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-[#10180B] transition-all hover:opacity-90"
          >
            Go home
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all hover:bg-card"
            style={{ borderColor: "#38383a", color: "#f5f5f7" }}
          >
            Visit blog
          </Link>
        </div>
      </div>
    </div>
  );
}
