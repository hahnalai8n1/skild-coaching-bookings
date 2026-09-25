import Link from "next/link";
import { ArrowRight, CalendarCheck2, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8fc]">
      <nav className="relative z-10 mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="button button-ghost">Sign in</Link>
          <Link href="/signup" className="button button-primary">Get started</Link>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-6xl gap-16 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-28 lg:pt-20">
        <div className="pointer-events-none absolute -left-36 top-0 size-[30rem] rounded-full bg-[#dce9ff]/55 blur-3xl" />
        <div className="relative">
          <div className="eyebrow"><ShieldCheck size={14} /> Built for independent coaches</div>
          <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.055em] text-[#171b2f] sm:text-6xl lg:text-7xl">
            Your sessions,<br /><span className="text-[#174f9e]">under control.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#5f677d]">
            A focused workspace to create, organise and manage every coaching session—without losing time to admin.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="button button-primary button-large">Create coach account <ArrowRight size={17} /></Link>
            <Link href="/login" className="button button-secondary button-large">Open dashboard</Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#6d7488]">
            <span className="flex items-center gap-2"><Check className="text-[#23805b]" size={16} /> Free to use</span>
            <span className="flex items-center gap-2"><Check className="text-[#23805b]" size={16} /> Secure by design</span>
            <span className="flex items-center gap-2"><Check className="text-[#23805b]" size={16} /> Mobile ready</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:mx-0">
          <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-[#dce9ff] to-[#eef1fb] blur-2xl" />
          <div className="relative rounded-[2rem] border border-white/80 bg-white p-5 shadow-[0_30px_90px_rgba(35,45,85,0.16)] sm:p-7">
            <div className="flex items-center justify-between border-b border-[#ebedf5] pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9298aa]">Thursday</p>
                <p className="mt-1 text-2xl font-extrabold tracking-[-0.035em] text-[#20253d]">Your schedule</p>
              </div>
              <span className="grid size-11 place-items-center rounded-2xl bg-[#252b49] text-white"><CalendarCheck2 size={21} /></span>
            </div>
            <div className="mt-5 space-y-3">
              <PreviewSession time="8:00" title="Private skills session" location="Court 2 · 60 min" active />
              <PreviewSession time="11:30" title="Speed and agility" location="Main oval · 45 min" />
              <PreviewSession time="16:00" title="Online review" location="Google Meet · 30 min" />
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f4f7fd] px-4 py-3.5 text-sm text-[#596176]">
              <LockKeyhole className="text-[#174f9e]" size={17} />
              Your data stays private to your account.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PreviewSession({ time, title, location, active = false }: { time: string; title: string; location: string; active?: boolean }) {
  return (
    <div className={`flex gap-4 rounded-2xl border p-4 ${active ? "border-[#bfd5fb] bg-[#f5f9ff]" : "border-[#e7eaf3]"}`}>
      <span className="w-12 shrink-0 text-sm font-extrabold text-[#174f9e]">{time}</span>
      <div>
        <p className="font-bold text-[#252a42]">{title}</p>
        <p className="mt-1 text-sm text-[#7a8194]">{location}</p>
      </div>
    </div>
  );
}
