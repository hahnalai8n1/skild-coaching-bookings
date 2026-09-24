# SKILD Coaching Bookings — Technical Task

A small coaching bookings app built for SKILD's Machine Learning & Data
Science / engineering take-home task, using Next.js, TypeScript and
Supabase. A coach can sign up, log in, create sessions, view their own
sessions, and edit or cancel them. Data is isolated per coach entirely
through PostgreSQL Row Level Security, not application-level filtering.

## Stack

- **Next.js 15** (App Router, Server Components, Server Actions) — pinned to
  match the version named in the internship's engineering hiring brief.
- **TypeScript**, strict mode.
- **Supabase**: Postgres, Auth, and `@supabase/ssr` for cookie-based sessions
  across Server Components / Server Actions / middleware.
- Tailwind for styling — kept deliberately plain, since the task is about
  the data model and auth flow, not visual design.

No other backend, no ORM: just `supabase-js` calls against Postgres,
directly from Server Components and Server Actions.

## Getting it running

```bash
npm install
cp .env.example .env.local   # fill in your own Supabase project's URL + anon key
```

Run the SQL in [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
against your Supabase project (SQL Editor → paste → Run, or
`supabase db push` if you're using the CLI). It creates both tables, the
trigger that provisions a coach profile on signup, and every RLS policy.

```bash
npm run dev
```

**For quick manual testing**, turn off "Confirm email" under Authentication
→ Sign In / Providers → Email in the Supabase dashboard. With it on,
`signUp()` succeeds but returns no session until the coach clicks the
confirmation link, which the app handles (see `src/app/signup/actions.ts`),
but it slows down a first look at the app.

## Database structure

Two tables (full definitions and comments in
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)):

**`coaches`** — one row per authenticated user, `id` is a foreign key to
`auth.users(id)`. Supabase Auth already owns credentials and sessions; this
table exists only so the app has profile data to query and join against
without ever touching the protected `auth` schema from the client. A
`security definer` trigger (`handle_new_user`) inserts a row here the moment
someone signs up, copying `email` and the `full_name` passed at signup.

**`sessions`** — one row per coaching session. `coach_id` references
`coaches(id)`. `status` is `'scheduled'` or `'cancelled'` (a `check`
constraint, not a free-text column). A `check` constraint also rejects
`end_time <= start_time` at the database level, and a trigger keeps
`updated_at` current on every update.

```
auth.users (Supabase-managed)
     │  1:1 (trigger-provisioned)
     ▼
coaches (id, email, full_name, created_at)
     │  1:many
     ▼
sessions (id, coach_id, title, session_date, start_time, end_time,
          location, notes, status, created_at, updated_at)
```

## RLS / security setup

Every policy is written against `auth.uid()`, the id Supabase derives from
the caller's JWT — never against a value the client sends. This is the
part of the brief I treated as the actual point of the exercise, not a box
to tick:

- **`coaches`**: a coach can `select`/`update` only the row where
  `id = auth.uid()`. There is no `insert` or `delete` policy at all — rows
  are created solely by the `security definer` trigger, so a coach can
  never create or remove a profile row through the API, only through
  signing up / the account being deleted.
- **`sessions`**: `select`, `insert`, and `update` are each scoped to
  `coach_id = auth.uid()`. There is **no delete policy**. The app never
  hard-deletes a session — "cancel" sets `status = 'cancelled'` via the same
  update policy — so booking history is preserved, and a session can't be
  hard-deleted through the API even if a future bug tried to. That's least
  privilege, not just "the UI has no delete button."

Two things worth being explicit about, since they're easy to get wrong
silently:

1. **Application code never filters by `coach_id` to enforce isolation.**
   `src/app/sessions/page.tsx` does `select("*")` with no `.eq("coach_id", ...)`
   — RLS is what restricts the result set, not a `WHERE` clause a future
   change could accidentally drop. Where an update *does* add
   `.eq("coach_id", user.id)` (in `src/app/sessions/actions.ts`), it's there
   so a wrong id fails with a clear "Session not found" instead of silently
   matching zero rows — RLS would have blocked the write either way.
2. **A session belonging to another coach and a session that doesn't exist
   look identical.** `sessions/[id]/edit` does `.select("*").eq("id", id).single()`
   with no owner check in the query — RLS already guarantees that query can
   only ever return a row `auth.uid()` owns, so someone else's id comes back
   as "no row," exactly like a wrong or deleted id. `not-found.tsx` shows
   the same message either way, rather than confirming a given id exists.

I verified this rather than assumed it: created a session as one coach,
signed in as a second coach, and confirmed their session list stayed empty
and navigating straight to the first coach's `/sessions/[id]/edit` URL
returned the "doesn't exist, or it isn't yours" page rather than the data.

**Defence in depth beyond RLS**: `src/middleware.ts` redirects any
unauthenticated request away from every route except `/login` and
`/signup`, and every Server Component also checks `auth.getUser()` and
redirects itself. Either one alone would already stop an unauthenticated
request; RLS is what stops an *authenticated* one from reaching another
coach's data.

## Loading and error states

- `sessions/loading.tsx` — Next.js's Suspense-based route convention; shown
  automatically while the sessions list is being fetched, no manual
  `isLoading` state needed.
- Expected, user-facing errors (a failed insert, a failed update) are
  returned from the Server Action as `{ error: string }` and rendered
  inline next to the form, via `useActionState` — that's a better
  experience than bouncing to a generic error page for something like a
  validation failure.
- `sessions/error.tsx` — an Error Boundary for anything unexpected (a
  network failure, a bug) that escapes that inline handling.
- The sessions list itself checks `error` from the Supabase query and shows
  it inline rather than letting a failed fetch throw past the list.

## Assumptions and out-of-scope

Scoped deliberately for the ~4-6 hour budget rather than by omission:

- **"Cancel" is a soft delete** (`status = 'cancelled'`), not a row
  deletion — see the RLS section above for why.
- **No password reset / email change flow.** Auth is signup + login only.
- **No profile editing UI.** The `coaches` table and its trigger exist and
  are exercised (every signup creates a row), but there's no page to edit
  `full_name` after the fact.
- **Times are stored and compared as-is (Postgres `time`, no time zone).**
  For a single-timezone pilot this is fine; a coach and their athletes
  spanning multiple time zones would need `timestamptz` and an explicit
  zone, which I'd treat as a real design change, not a quick add.
- **No pagination** on the sessions list — fine at a coach's scale, not at
  an academy's.
- **No recurring sessions**, no notifications/reminders, no client/athlete
  side of the booking (this task is the coach's view only).
- `database.types.ts` is **hand-written** to match the migration, in the
  same shape `supabase gen types typescript` produces. In a longer-lived
  project I'd generate it from the live schema so it can't drift.

## What I'd verify next with more time

- An actual test suite (Jest for the validation helpers, Playwright for the
  two-coach isolation scenario I checked by hand) rather than one manual
  pass.
- A negative test hitting Supabase directly with a coach's own JWT but
  someone else's `coach_id` in the payload, to confirm the `insert`
  policy's `with check` rejects it — I'm relying on reading the policy
  correctly here, not on having forced that specific failure.
- Concurrent edits to the same session (last-write-wins right now).
