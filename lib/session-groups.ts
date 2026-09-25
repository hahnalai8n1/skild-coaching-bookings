import type { CoachingSession } from "./types";

export type SessionPhase = "upcoming" | "completed" | "cancelled";

export function sessionPhase(session: CoachingSession, now: Date): SessionPhase {
  if (session.status === "cancelled") return "cancelled";
  return new Date(session.ends_at) > now ? "upcoming" : "completed";
}

/**
 * Upcoming (including in-progress) sessions first, soonest at the top; finished
 * and cancelled sessions in a separate history list, most recent at the top.
 */
export function groupSessions(sessions: CoachingSession[], now: Date) {
  const byStart = (a: CoachingSession, b: CoachingSession) => a.starts_at.localeCompare(b.starts_at);
  const upcoming = sessions.filter((session) => sessionPhase(session, now) === "upcoming").sort(byStart);
  const history = sessions
    .filter((session) => sessionPhase(session, now) !== "upcoming")
    .sort((a, b) => byStart(b, a));

  return {
    upcoming,
    history,
    counts: {
      upcoming: upcoming.length,
      completed: history.filter((session) => session.status === "scheduled").length,
      cancelled: history.filter((session) => session.status === "cancelled").length,
    },
  };
}
