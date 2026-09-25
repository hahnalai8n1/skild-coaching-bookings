import { describe, expect, it } from "vitest";
import { groupSessions } from "./session-groups";
import type { CoachingSession } from "./types";

const now = new Date("2026-09-28T10:00:00.000Z");

function session(id: string, startsAt: string, endsAt: string, status: CoachingSession["status"] = "scheduled"): CoachingSession {
  return {
    id,
    coach_id: "coach",
    title: id,
    starts_at: startsAt,
    ends_at: endsAt,
    location: null,
    notes: null,
    status,
    cancelled_at: status === "cancelled" ? "2026-09-27T00:00:00.000Z" : null,
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
  };
}

describe("groupSessions", () => {
  const sessions = [
    session("later", "2026-09-30T08:00:00.000Z", "2026-09-30T09:00:00.000Z"),
    session("in-progress", "2026-09-28T09:30:00.000Z", "2026-09-28T10:30:00.000Z"),
    session("yesterday", "2026-09-27T08:00:00.000Z", "2026-09-27T09:00:00.000Z"),
    session("last-week", "2026-09-21T08:00:00.000Z", "2026-09-21T09:00:00.000Z"),
    session("cancelled", "2026-09-29T08:00:00.000Z", "2026-09-29T09:00:00.000Z", "cancelled"),
  ];

  it("lists upcoming and in-progress sessions soonest first", () => {
    expect(groupSessions(sessions, now).upcoming.map((s) => s.id)).toEqual(["in-progress", "later"]);
  });

  it("keeps finished and cancelled sessions in history, most recent first", () => {
    expect(groupSessions(sessions, now).history.map((s) => s.id)).toEqual(["cancelled", "yesterday", "last-week"]);
  });

  it("counts each phase", () => {
    expect(groupSessions(sessions, now).counts).toEqual({ upcoming: 2, completed: 2, cancelled: 1 });
  });
});
