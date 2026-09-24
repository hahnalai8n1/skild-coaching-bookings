"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SessionFormState = { error: string | null };

function parseSessionForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    session_date: String(formData.get("session_date") ?? ""),
    start_time: String(formData.get("start_time") ?? ""),
    end_time: String(formData.get("end_time") ?? ""),
    location: String(formData.get("location") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

/**
 * Field-level checks the browser's own `required`/`type` attributes don't
 * fully cover (a disabled JS-less submit, or a client that skips them).
 * The database's own CHECK constraint (end_time > start_time) is the real
 * backstop -- this just turns that into a friendly message instead of a
 * raw Postgres error, since a form submitted with JS disabled still reaches
 * this action directly.
 */
function validateSession(input: ReturnType<typeof parseSessionForm>): string | null {
  if (!input.title) return "Title is required.";
  if (!input.session_date) return "Date is required.";
  if (!input.start_time || !input.end_time) return "Start and end time are required.";
  if (input.end_time <= input.start_time) return "End time must be after start time.";
  return null;
}

export async function createSession(
  _prevState: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const input = parseSessionForm(formData);
  const validationError = validateSession(input);
  if (validationError) return { error: validationError };

  const { error } = await supabase.from("sessions").insert({
    ...input,
    coach_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/sessions");
  redirect("/sessions");
}

export async function updateSession(
  id: string,
  _prevState: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const input = parseSessionForm(formData);
  const validationError = validateSession(input);
  if (validationError) return { error: validationError };

  // RLS already guarantees this update can only ever touch a row owned by
  // `user.id` -- the `.eq("coach_id", user.id)` here is not what provides
  // that guarantee. It's here so that if `id` belongs to someone else, the
  // update matches zero rows and Supabase returns cleanly instead of the
  // caller having no idea whether it silently did nothing.
  const { data, error } = await supabase
    .from("sessions")
    .update(input)
    .eq("id", id)
    .eq("coach_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Session not found." };

  revalidatePath("/sessions");
  redirect("/sessions");
}

export async function cancelSession(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("sessions")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("coach_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/sessions");
}
