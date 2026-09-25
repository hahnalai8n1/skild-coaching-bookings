export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-4 w-28 rounded-full bg-[#e4e7f0]" />
        <div className="mt-5 h-12 w-72 rounded-2xl bg-[#e4e7f0]" />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-24 rounded-2xl bg-white" />)}
        </div>
        <div className="mt-10 space-y-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-32 rounded-2xl bg-white" />)}
        </div>
      </div>
    </main>
  );
}
