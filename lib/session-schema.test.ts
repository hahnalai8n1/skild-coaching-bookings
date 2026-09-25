import { describe, expect, it } from "vitest";
import { sessionSchema } from "./session-schema";

const validSession = {
  title: "Private skills session",
  startsAt: "2026-09-28T08:00:00.000Z",
  endsAt: "2026-09-28T09:00:00.000Z",
  location: "Court 2",
  notes: "Bring cones",
};

describe("sessionSchema", () => {
  it("accepts a valid session", () => {
    expect(sessionSchema.safeParse(validSession).success).toBe(true);
  });

  it("rejects an end time before the start time", () => {
    const result = sessionSchema.safeParse({
      ...validSession,
      endsAt: "2026-09-28T07:59:00.000Z",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.endsAt).toContain("End time must be after the start time");
    }
  });

  it("trims user-entered text", () => {
    const result = sessionSchema.parse({ ...validSession, title: "  Speed session  " });
    expect(result.title).toBe("Speed session");
  });
});
