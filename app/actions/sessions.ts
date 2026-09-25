"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sessionInputFromFormData, sessionSchema } from "@/lib/session-schema";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

// Lifecycle rules live in the database (see the 0002 migration); translate the
// ones a coach can realistically hit into plain language.
function lifecycleMessage(error: { message: string } | null, fallback: string) {
  if (error?.message.includes("Cancelled sessions cannot be changed")) {
    return "This session has been cancelled, so it can no longer be changed.";
  }
  if (error?.message.includes("already finished")) {
    return "This session has already finished, so it can't be cancelled.";
  }
  return fallback;
}

async function authenticatedCoach() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { supabase, user: null };
  }
  return { supabase, user: data.user };
}

export async function createSessionAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = sessionSchema.safeParse(sessionInputFromFormData(formData));
  if (!parsed.success) {
    return { status: "error", message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user } = await authenticatedCoach();
  if (!user) {
    return { status: "error", message: "Your session expired. Sign in and try again." };
  }

  const { error } = await supabase.from("sessions").insert({
    coach_id: user.id,
    title: parsed.data.title,
    starts_at: parsed.data.startsAt,
    ends_at: parsed.data.endsAt,
    location: parsed.data.location || null,
    notes: parsed.data.notes || null,
  });

  if (error) {
    return { status: "error", message: "We could not create the session. Please try again." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?notice=created");
}

export async function updateSessionAction(
  sessionId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = sessionSchema.safeParse(sessionInputFromFormData(formData));
  if (!parsed.success) {
    return { status: "error", message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user } = await authenticatedCoach();
  if (!user) {
    return { status: "error", message: "Your session expired. Sign in and try again." };
  }

  const { data, error } = await supabase
    .from("sessions")
    .update({
      title: parsed.data.title,
      starts_at: parsed.data.startsAt,
      ends_at: parsed.data.endsAt,
      location: parsed.data.location || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", sessionId)
    .eq("coach_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      status: "error",
      message: lifecycleMessage(error, "This session could not be updated. It may no longer be available."),
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?notice=updated");
}

export async function cancelSessionAction(sessionId: string): Promise<{ error?: string }> {
  const { supabase, user } = await authenticatedCoach();
  if (!user) {
    return { error: "Your session expired. Sign in and try again." };
  }

  const { data, error } = await supabase
    .from("sessions")
    .update({ status: "cancelled" })
    .eq("id", sessionId)
    .eq("coach_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: lifecycleMessage(error, "This session could not be cancelled.") };
  }

  revalidatePath("/dashboard");
  return {};
}
