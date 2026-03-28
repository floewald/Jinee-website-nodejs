import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>
      <h1>404 — Page Not Found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="btn btn--primary">
        Back to Home
      </Link>
    </main>
  );
}
