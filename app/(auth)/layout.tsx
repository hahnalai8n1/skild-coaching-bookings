import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[.9fr_1.1fr]">
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between">
          <Brand />
          <Link href="/" className="button button-ghost"><ArrowLeft size={16} /> Home</Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">{children}</div>
      </section>
      <aside className="relative hidden overflow-hidden bg-[#202642] p-14 text-white lg:flex lg:flex-col lg:justify-end">
        <div className="absolute -right-24 -top-24 size-[28rem] rounded-full border border-white/10" />
        <div className="absolute -right-10 -top-10 size-[18rem] rounded-full border border-white/10" />
        <div className="absolute left-14 top-20 grid size-14 place-items-center rounded-2xl bg-white/10">
          <ShieldCheck size={27} />
        </div>
        <div className="relative max-w-lg">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9fbfe9]">Privacy by design</p>
          <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-0.04em]">Your schedule belongs to you.</h2>
          <p className="mt-5 text-base leading-7 text-[#cbd3e8]">
            Database-level access rules protect every session—even if someone changes a browser request or guesses an ID.
          </p>
        </div>
      </aside>
    </main>
  );
}
