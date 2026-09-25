import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SessionForm } from "../../session-form";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  // RLS already scopes this select to the signed-in coach's own rows, so a
  // session that belongs to someone else comes back as "no row" -- exactly
  // the same result as a wrong or deleted id. That ambiguity is intentional
  // (see not-found.tsx): the app never has to distinguish "not yours" from
  // "doesn't exist" in application code, because the database never hands
  // back a row it isn't allowed to.
  if (!session) notFound();

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Edit session</h1>
      <SessionForm mode="edit" session={session} />
    </main>
  );
}
