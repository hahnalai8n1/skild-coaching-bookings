"use client";

import { useEffect } from "react";

// Catches anything unexpected (a network failure, a bug) that escapes the
// try/catch-free happy path in page.tsx. Expected, user-facing errors --
// like a failed insert -- are instead shown inline via the Server Action's
// returned `state.error`, next to the field that caused them, which is a
// better experience than bouncing to this generic boundary.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p role="alert" className="mb-4 text-sm text-red-600">
        Something went wrong loading your sessions.
      </p>
      <button
        onClick={reset}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      >
        Try again
      </button>
    </main>
  );
}
