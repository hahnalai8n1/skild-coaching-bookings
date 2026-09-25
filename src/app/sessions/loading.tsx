// Next.js renders this automatically while the async Server Component in
// page.tsx is fetching -- no manual isLoading state needed for the initial
// load of the list.
export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm text-gray-500">Loading your sessions…</p>
    </main>
  );
}
