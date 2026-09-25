import Link from "next/link";
import { Activity } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="Coachdesk home">
      <span className="grid size-9 place-items-center rounded-xl bg-[#252b49] text-white shadow-sm transition-transform group-hover:-rotate-3">
        <Activity aria-hidden="true" size={19} strokeWidth={2.5} />
      </span>
      {compact ? null : (
        <span className="text-[1.05rem] font-extrabold tracking-[-0.035em] text-[#171b2f]">coachdesk</span>
      )}
    </Link>
  );
}
