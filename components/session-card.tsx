import Link from "next/link";
import { CalendarDays, MapPin, PencilLine } from "lucide-react";
import type { CoachingSession } from "@/lib/types";
import { CancelSessionButton } from "./cancel-session-button";
import { LocalDateTime } from "./local-date-time";

export function SessionCard({ session }: { session: CoachingSession }) {
  const isCancelled = session.status === "cancelled";

  return (
    <article className={`session-card ${isCancelled ? "session-card-cancelled" : ""}`}>
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <span className={`mt-0.5 grid size-11 shrink-0 place-items-center rounded-2xl ${isCancelled ? "bg-[#f1f2f6] text-[#8b90a0]" : "bg-[#edf4ff] text-[#174f9e]"}`}>
          <CalendarDays aria-hidden="true" size={20} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-bold tracking-[-0.01em] text-[#20253d]">{session.title}</h3>
            <span className={`status-badge ${isCancelled ? "status-cancelled" : "status-scheduled"}`}>
              {isCancelled ? "Cancelled" : "Scheduled"}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-medium text-[#5d657b]">
            <LocalDateTime startsAt={session.starts_at} endsAt={session.ends_at} />
          </p>
          {session.location ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[#7a8194]">
              <MapPin aria-hidden="true" size={14} />
              <span className="truncate">{session.location}</span>
            </p>
          ) : null}
          {session.notes ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#747b8f]">{session.notes}</p> : null}
        </div>
      </div>

      {isCancelled ? null : (
        <div className="flex shrink-0 items-center gap-3 border-t border-[#edf0f7] pt-4 sm:border-0 sm:pt-0">
          <Link href={`/sessions/${session.id}/edit`} className="session-action">
            <PencilLine aria-hidden="true" size={15} /> Edit
          </Link>
          <CancelSessionButton sessionId={session.id} />
        </div>
      )}
    </article>
  );
}
