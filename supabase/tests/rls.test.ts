import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

// Runs the real migrations in an in-process Postgres (PGlite) with the parts of
// Supabase that RLS depends on: the anon/authenticated roles, Supabase's default
// table grants, and an auth.uid() that reads the caller's JWT subject.
// No Supabase project or service-role key is needed, so this runs in CI.

const COACH_A = "00000000-0000-4000-a000-00000000000a";
const COACH_B = "00000000-0000-4000-a000-00000000000b";

const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;

  create schema auth;
  create table auth.users (id uuid primary key, email text not null);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;

  grant usage on schema auth to anon, authenticated;
  grant usage on schema public to anon, authenticated;
  -- Supabase grants table privileges to API roles by default; RLS is what restricts them.
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on functions to anon, authenticated;
`;

const migrationsDir = join(import.meta.dirname, "..", "migrations");
const tomorrow = () => new Date(Date.now() + 86_400_000);

let db: PGlite;

type Caller = { role: "anon" } | { role: "authenticated"; sub: string };
const asCoach = (sub: string): Caller => ({ role: "authenticated", sub });
const anon: Caller = { role: "anon" };

async function as<T>(caller: Caller, sql: string, params: unknown[] = []) {
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [caller.role === "anon" ? "" : caller.sub]);
  await db.exec(`set role ${caller.role}`);
  try {
    return await db.query<T>(sql, params);
  } finally {
    await db.exec("reset role");
  }
}

async function createSession(coach: string, overrides: { starts?: Date; ends?: Date; title?: string } = {}) {
  const starts = overrides.starts ?? tomorrow();
  const ends = overrides.ends ?? new Date(starts.getTime() + 3_600_000);
  const { rows } = await as<{ id: string; coach_id: string }>(
    asCoach(coach),
    "insert into public.sessions (title, starts_at, ends_at) values ($1, $2, $3) returning id, coach_id",
    [overrides.title ?? "Private skills session", starts.toISOString(), ends.toISOString()],
  );
  return rows[0];
}

async function titleOf(id: string) {
  const { rows } = await db.query<{ title: string; status: string }>("select title, status from public.sessions where id = $1", [id]);
  return rows[0];
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_STUB);
  for (const file of readdirSync(migrationsDir).filter((name) => name.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(join(migrationsDir, file), "utf8"));
  }
  await db.query("insert into auth.users (id, email) values ($1, 'a@example.com'), ($2, 'b@example.com')", [COACH_A, COACH_B]);
});

beforeEach(async () => {
  await db.exec("truncate public.sessions");
});

afterAll(async () => {
  await db.close();
});

describe("coach isolation (RLS)", () => {
  it("assigns the signed-in coach as owner by default", async () => {
    const session = await createSession(COACH_A);
    expect(session.coach_id).toBe(COACH_A);
  });

  it("only returns a coach's own sessions", async () => {
    await createSession(COACH_A, { title: "A session" });
    await createSession(COACH_B, { title: "B session" });

    const { rows } = await as<{ title: string }>(asCoach(COACH_B), "select title from public.sessions");
    expect(rows.map((row) => row.title)).toEqual(["B session"]);
  });

  it("hides another coach's session even when queried by id", async () => {
    const session = await createSession(COACH_A);
    const { rows } = await as(asCoach(COACH_B), "select id from public.sessions where id = $1", [session.id]);
    expect(rows).toHaveLength(0);
  });

  it("prevents editing another coach's session", async () => {
    const session = await createSession(COACH_A);
    const result = await as(asCoach(COACH_B), "update public.sessions set title = 'Tampered' where id = $1", [session.id]);
    expect(result.affectedRows).toBe(0);
    expect((await titleOf(session.id)).title).toBe("Private skills session");
  });

  it("prevents cancelling another coach's session", async () => {
    const session = await createSession(COACH_A);
    const result = await as(asCoach(COACH_B), "update public.sessions set status = 'cancelled' where id = $1", [session.id]);
    expect(result.affectedRows).toBe(0);
    expect((await titleOf(session.id)).status).toBe("scheduled");
  });

  it("prevents creating a session on behalf of another coach", async () => {
    await expect(
      as(asCoach(COACH_B), "insert into public.sessions (coach_id, title, starts_at, ends_at) values ($1, 'Forged', $2, $3)", [
        COACH_A,
        tomorrow().toISOString(),
        new Date(tomorrow().getTime() + 3_600_000).toISOString(),
      ]),
    ).rejects.toThrow(/row-level security/);
  });

  it("prevents transferring a session to another coach", async () => {
    const session = await createSession(COACH_A);
    await expect(
      as(asCoach(COACH_A), "update public.sessions set coach_id = $1 where id = $2", [COACH_B, session.id]),
    ).rejects.toThrow();
    const { rows } = await db.query<{ coach_id: string }>("select coach_id from public.sessions where id = $1", [session.id]);
    expect(rows[0].coach_id).toBe(COACH_A);
  });

  it("does not allow anyone to hard-delete sessions", async () => {
    const session = await createSession(COACH_A);
    await expect(as(asCoach(COACH_B), "delete from public.sessions where id = $1", [session.id])).rejects.toThrow(/permission denied/);
    await expect(as(asCoach(COACH_A), "delete from public.sessions where id = $1", [session.id])).rejects.toThrow(/permission denied/);
    expect(await titleOf(session.id)).toBeDefined();
  });

  it("denies signed-out visitors any access", async () => {
    await createSession(COACH_A);
    await expect(as(anon, "select id from public.sessions")).rejects.toThrow(/permission denied/);
    await expect(
      as(anon, "insert into public.sessions (coach_id, title, starts_at, ends_at) values ($1, 'Anon', now() + interval '1 day', now() + interval '25 hours')", [COACH_A]),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("session lifecycle rules", () => {
  it("records when a session is cancelled", async () => {
    const session = await createSession(COACH_A);
    const { rows } = await as<{ status: string; cancelled_at: string | null }>(
      asCoach(COACH_A),
      "update public.sessions set status = 'cancelled' where id = $1 returning status, cancelled_at",
      [session.id],
    );
    expect(rows[0].status).toBe("cancelled");
    expect(rows[0].cancelled_at).not.toBeNull();
  });

  it("treats cancellation as final", async () => {
    const session = await createSession(COACH_A);
    await as(asCoach(COACH_A), "update public.sessions set status = 'cancelled' where id = $1", [session.id]);

    await expect(as(asCoach(COACH_A), "update public.sessions set title = 'Edited' where id = $1", [session.id])).rejects.toThrow(
      /Cancelled sessions cannot be changed/,
    );
    await expect(
      as(asCoach(COACH_A), "update public.sessions set status = 'scheduled' where id = $1", [session.id]),
    ).rejects.toThrow(/Cancelled sessions cannot be changed/);
  });

  it("does not allow cancelling a session that has already finished", async () => {
    const starts = new Date(Date.now() - 2 * 3_600_000);
    const session = await createSession(COACH_A, { starts, ends: new Date(starts.getTime() + 3_600_000) });
    await expect(
      as(asCoach(COACH_A), "update public.sessions set status = 'cancelled' where id = $1", [session.id]),
    ).rejects.toThrow(/already finished/);
  });

  it("always creates sessions as scheduled", async () => {
    const { rows } = await as<{ status: string; cancelled_at: string | null }>(
      asCoach(COACH_A),
      "insert into public.sessions (title, starts_at, ends_at, status) values ('Sneaky', now() + interval '1 day', now() + interval '25 hours', 'cancelled') returning status, cancelled_at",
    );
    expect(rows[0]).toEqual({ status: "scheduled", cancelled_at: null });
  });

  it("rejects a session that ends before it starts", async () => {
    await expect(
      as(asCoach(COACH_A), "insert into public.sessions (title, starts_at, ends_at) values ('Backwards', now() + interval '2 hours', now() + interval '1 hour')"),
    ).rejects.toThrow(/sessions_end_after_start/);
  });
});
