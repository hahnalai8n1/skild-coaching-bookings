"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignupFormState = { error: string | null; message: string | null };

export async function signup(
  _prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { error: "All fields are required.", message: null };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters.", message: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: error.message, message: null };
  }

  // If the Supabase project has "Confirm email" turned on, signUp succeeds
  // but returns no session yet -- the coach has to click the email link
  // before they can sign in. Handle both cases rather than assuming one.
  if (!data.session) {
    return {
      error: null,
      message: "Check your email to confirm your account, then sign in.",
    };
  }

  redirect("/sessions");
}
