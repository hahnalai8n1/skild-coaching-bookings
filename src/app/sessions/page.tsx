import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CancelButton } from "./cancel-button";
import { LogoutButton } from "@/components/logout-button";

export default async function SessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // No coach_id filter here -- RLS ("Coaches can view their own sessions")
  // already restricts this select to rows where coach_id = auth.uid(). If
  // a filter were added here too, that would be defence in depth, not the
  // actual mechanism keeping other coaches' rows out.
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("*")
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Your sessions</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sessions/new"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            New session
          </Link>
          <LogoutButton />
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Couldn&apos;t load your sessions: {error.message}
        </p>
      )}

      {!error && sessions?.length === 0 && (
        <p className="text-sm text-gray-500">No sessions yet. Create your first one.</p>
      )}

      <ul className="divide-y divide-gray-200">
        {sessions?.map((s) => (
          <li key={s.id} className="flex items-center justify-between py-3">
            <div>
              <p
                className={
                  s.status === "cancelled"
                    ? "font-medium text-gray-400 line-through"
                    : "font-medium"
                }
              >
                {s.title}
              </p>
              <p className="text-sm text-gray-500">
                {s.session_date} · {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                {s.location ? ` · ${s.location}` : ""}
              </p>
              {s.status === "cancelled" && (
                <span className="text-xs font-medium uppercase text-red-500">
                  Cancelled
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/sessions/${s.id}/edit`} className="text-sm text-slate-700 underline">
                Edit
              </Link>
              {s.status !== "cancelled" && <CancelButton id={s.id} />}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
