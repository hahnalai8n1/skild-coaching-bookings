import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8fc] px-5">
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#eef0f6] text-[#656d82]"><SearchX size={22} /></span>
        <h1 className="mt-5 text-2xl font-black tracking-[-0.035em] text-[#20253d]">Session not found</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[#747b8f]">It may be cancelled, removed, or owned by another coach.</p>
        <Link href="/dashboard" className="button button-primary mt-6">Back to dashboard</Link>
      </div>
    </main>
  );
}
