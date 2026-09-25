import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="w-full">
      <p className="eyebrow w-fit">Coach access</p>
      <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] text-[#171b2f]">Welcome back</h1>
      <p className="mt-3 text-base leading-7 text-[#697086]">Sign in to manage your upcoming sessions.</p>
      {!hasSupabaseEnv() ? <ConfigNotice /> : null}
      {error ? <div className="error-banner mt-6">The confirmation link is invalid or expired.</div> : null}
      <div className="mt-8"><AuthForm mode="login" /></div>
    </div>
  );
}

function ConfigNotice() {
  return <div className="notice-banner mt-6">Preview mode: add Supabase credentials to enable authentication.</div>;
}
