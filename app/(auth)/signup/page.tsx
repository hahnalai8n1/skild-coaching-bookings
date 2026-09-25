import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <div className="w-full">
      <p className="eyebrow w-fit">Start coaching</p>
      <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] text-[#171b2f]">Create your account</h1>
      <p className="mt-3 text-base leading-7 text-[#697086]">Set up a private workspace for your coaching sessions.</p>
      {!hasSupabaseEnv() ? <div className="notice-banner mt-6">Preview mode: add Supabase credentials to enable authentication.</div> : null}
      <div className="mt-8"><AuthForm mode="signup" /></div>
    </div>
  );
}
