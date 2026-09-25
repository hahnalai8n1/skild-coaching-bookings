export type SessionStatus = "scheduled" | "cancelled";

export type CoachingSession = {
  id: string;
  coach_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  location: string | null;
  notes: string | null;
  status: SessionStatus;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export const SESSION_COLUMNS =
  "id, coach_id, title, starts_at, ends_at, location, notes, status, cancelled_at, created_at, updated_at";

export type ActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"email" | "password" | "title" | "startsAt" | "endsAt" | "location" | "notes", string[]>>;
};

export const INITIAL_ACTION_STATE: ActionState = { status: "idle" };
