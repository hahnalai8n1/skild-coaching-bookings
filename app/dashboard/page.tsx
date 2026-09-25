import Link from "next/link";
import { CalendarCheck2, CalendarClock, CirclePlus, History } from "lucide-react";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SessionCard } from "@/components/session-card";
import { SetupRequired } from "@/components/setup-required";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { groupSessions, sessionPhase } from "@/lib/session-groups";
import { SESSION_COLUMNS, type CoachingSession } from "@/lib/types";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  if (!hasSupabaseEnv()) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f8fc] px-5"><SetupRequired /></main>;
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_COLUMNS)
    .order("starts_at", { ascending: true });

  if (error) throw new Error("Unable to load coaching sessions.");

  const sessions = (data ?? []) as CoachingSession[];
  const now = new Date();
  const { upcoming, history, counts } = groupSessions(sessions, now);
  const { notice } = await searchParams;

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <AppHeader email={authData.user.email ?? "Coach"} />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {notice === "created" || notice === "updated" ? (
          <div className="success-banner mb-7" role="status">
            {notice === "created" ? "Session created successfully." : "Session updated successfully."}
          </div>
        ) : null}

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow w-fit">Coach workspace</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] text-[#171b2f] sm:text-5xl">Your sessions</h1>
            <p className="mt-3 text-base text-[#697086]">Plan the work. Keep the schedule clear.</p>
          </div>
          <Link href="/sessions/new" className="button button-primary button-large self-start sm:self-auto">
            <CirclePlus aria-hidden="true" size={18} /> Create session
          </Link>
        </div>

        <section className="mt-9 grid gap-4 sm:grid-cols-3" aria-label="Session summary">
          <Metric label="Upcoming" value={counts.upcoming} icon={<CalendarClock size={19} />} tone="blue" />
          <Metric label="Completed" value={counts.completed} icon={<CalendarCheck2 size={19} />} tone="green" />
          <Metric label="Cancelled" value={counts.cancelled} icon={<History size={19} />} tone="grey" />
        </section>

        <section className="mt-10" aria-labelledby="upcoming-heading">
          <SectionHeading id="upcoming-heading" title="Upcoming" count={upcoming.length} />
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((session) => <SessionCard key={session.id} session={session} phase="upcoming" />)}
            </div>
          ) : (
            <EmptyState hasHistory={history.length > 0} />
          )}
        </section>

        {history.length > 0 ? (
          <section className="mt-12" aria-labelledby="history-heading">
            <SectionHeading id="history-heading" title="Past & cancelled" count={history.length} />
            <div className="space-y-3">
              {history.map((session) => <SessionCard key={session.id} session={session} phase={sessionPhase(session, now)} />)}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function Metric({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: "blue" | "green" | "grey" }) {
  return (
    <div className="metric-card">
      <span className={`metric-icon metric-${tone}`}>{icon}</span>
      <div>
        <p className="text-2xl font-black tracking-[-0.035em] text-[#20253d]">{value}</p>
        <p className="text-sm font-medium text-[#747b8f]">{label}</p>
      </div>
    </div>
  );
}

function SectionHeading({ id, title, count }: { id: string; title: string; count: number }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 id={id} className="text-lg font-extrabold tracking-[-0.02em] text-[#252a42]">{title}</h2>
      <span className="text-sm font-medium text-[#858b9d]">{count} {count === 1 ? "session" : "sessions"}</span>
    </div>
  );
}

function EmptyState({ hasHistory }: { hasHistory: boolean }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#ccd2e3] bg-white px-6 py-16 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#eef4ff] text-[#174f9e]"><CalendarCheck2 size={22} /></span>
      <h3 className="mt-5 text-lg font-extrabold text-[#252a42]">Your schedule is clear</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#747b8f]">
        {hasHistory
          ? "Nothing coming up. Add your next session when you're ready."
          : "Create your first session to keep its time, location and notes in one place."}
      </p>
      <Link href="/sessions/new" className="button button-primary mt-6"><CirclePlus size={17} /> {hasHistory ? "Create session" : "Create first session"}</Link>
    </div>
  );
}
