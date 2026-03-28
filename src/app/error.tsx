"use client";
// Required: Next.js App Router error boundary — shown when a client component
// throws an unhandled error at runtime.
// https://nextjs.org/docs/app/building-your-application/routing/error-handling

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred. Please try again.</p>
      <button onClick={reset} className="btn">
        Try again
      </button>
    </main>
  );
}
