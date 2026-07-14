"use client";

export const dynamic = "force-dynamic";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h1 className="text-4xl font-bold">Something went wrong</h1>
          <button onClick={() => reset()} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
