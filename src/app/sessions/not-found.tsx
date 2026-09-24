import Link from "next/link";

// Shown when /sessions/[id]/edit calls notFound() -- which happens both for
// a genuinely missing id AND for a session that belongs to another coach
// (RLS makes that query return zero rows either way). Showing the same
// message for both avoids confirming to a coach that a given id exists at
// all.
export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="mb-4 text-sm text-gray-600">
        That session doesn&apos;t exist, or it isn&apos;t yours.
      </p>
      <Link href="/sessions" className="text-sm underline">
        Back to your sessions
      </Link>
    </main>
  );
}
