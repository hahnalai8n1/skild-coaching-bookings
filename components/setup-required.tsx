import { DatabaseZap } from "lucide-react";

export function SetupRequired() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-[#d9deef] bg-white p-8 text-center shadow-[0_18px_60px_rgba(37,43,73,0.08)]">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#eef4ff] text-[#174f9e]">
        <DatabaseZap aria-hidden="true" size={23} />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.03em] text-[#171b2f]">Connect Supabase to continue</h1>
      <p className="mt-3 text-sm leading-6 text-[#626a80]">
        Copy <code>.env.example</code> to <code>.env.local</code>, add your project credentials, then apply the database migration.
      </p>
    </div>
  );
}
