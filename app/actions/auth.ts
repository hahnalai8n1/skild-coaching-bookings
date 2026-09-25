"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { ActionState } from "@/lib/types";

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function parseCredentials(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

export async function signInAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const values = { email: String(formData.get("email") ?? "") };
  if (!hasSupabaseEnv()) {
    return { status: "error", values, message: "Supabase is not configured yet. Follow the README setup steps first." };
  }
  const parsed = parseCredentials(formData);
  if (!parsed.success) {
    return { status: "error", values, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { status: "error", values, message: error.message };
  }

  redirect("/dashboard");
}

export async function signUpAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const values = { email: String(formData.get("email") ?? "") };
  if (!hasSupabaseEnv()) {
    return { status: "error", values, message: "Supabase is not configured yet. Follow the README setup steps first." };
  }
  const parsed = parseCredentials(formData);
  if (!parsed.success) {
    return { status: "error", values, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    return { status: "error", values, message: error.message };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/check-email");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
