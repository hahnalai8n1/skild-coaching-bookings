import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SessionForm } from "@/components/session-form";
import { SetupRequired } from "@/components/setup-required";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function NewSessionPage() {
  if (!hasSupabaseEnv()) return <main className="grid min-h-screen place-items-center bg-[#f7f8fc] px-5"><SetupRequired /></main>;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <AppHeader email={data.user.email ?? "Coach"} />
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="eyebrow w-fit">New booking</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] text-[#171b2f]">Create a session</h1>
        <p className="mt-3 text-base text-[#697086]">Add the essentials now. You can update them later.</p>
        <div className="mt-8 rounded-3xl border border-[#e1e5f0] bg-white p-6 shadow-[0_18px_60px_rgba(37,43,73,0.06)] sm:p-9">
          <SessionForm mode="create" />
        </div>
      </main>
    </div>
  );
}
