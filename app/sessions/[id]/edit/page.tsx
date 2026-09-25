import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SessionForm } from "@/components/session-form";
import { SetupRequired } from "@/components/setup-required";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { CoachingSession } from "@/lib/types";

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabaseEnv()) return <main className="grid min-h-screen place-items-center bg-[#f7f8fc] px-5"><SetupRequired /></main>;
  const { id } = await params;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data, error } = await supabase
    .from("sessions")
    .select("id, coach_id, title, starts_at, ends_at, location, notes, status, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data || data.status === "cancelled") notFound();

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <AppHeader email={authData.user.email ?? "Coach"} />
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="eyebrow w-fit">Session details</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] text-[#171b2f]">Edit session</h1>
        <p className="mt-3 text-base text-[#697086]">Changes apply only to this session.</p>
        <div className="mt-8 rounded-3xl border border-[#e1e5f0] bg-white p-6 shadow-[0_18px_60px_rgba(37,43,73,0.06)] sm:p-9">
          <SessionForm mode="edit" session={data as CoachingSession} />
        </div>
      </main>
    </div>
  );
}
