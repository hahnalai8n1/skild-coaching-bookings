-- Coaching bookings schema.
--
-- Two tables: a `coaches` profile row per authenticated user, and the
-- `sessions` each coach owns. Row Level Security is the only thing that
-- decides who can read or write a row -- every policy compares the row's
-- owner column to auth.uid(), the id Supabase derives from the signed-in
-- user's JWT on every request. Application code never adds its own
-- "WHERE coach_id = ..." filter to enforce this; the database enforces it
-- even if a future code change forgets to.

-- ── coaches ──────────────────────────────────────────────────────────────
-- Mirrors auth.users so the app has a place to keep profile data without
-- ever querying the protected `auth` schema directly from the client.

create table public.coaches (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.coaches enable row level security;

create policy "Coaches can view their own profile"
  on public.coaches for select
  using (auth.uid() = id);

create policy "Coaches can update their own profile"
  on public.coaches for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert/delete policy on purpose: rows are created only by the trigger
-- below (running as the function owner, which bypasses RLS) and removed
-- only via the auth.users cascade when an account is deleted. A coach can
-- never insert or delete a profile row directly through the API.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.coaches (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── sessions ─────────────────────────────────────────────────────────────

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches (id) on delete cascade,
  title text not null,
  session_date date not null,
  start_time time not null,
  end_time time not null,
  location text,
  notes text,
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sessions_end_after_start check (end_time > start_time)
);

create index sessions_coach_id_idx on public.sessions (coach_id);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute procedure public.set_updated_at();

alter table public.sessions enable row level security;

-- Every policy is scoped by coach_id = auth.uid(). This is what actually
-- stops coach A from ever seeing or touching coach B's rows -- not
-- application code remembering to filter by the current user.

create policy "Coaches can view their own sessions"
  on public.sessions for select
  using (auth.uid() = coach_id);

create policy "Coaches can create sessions for themselves"
  on public.sessions for insert
  with check (auth.uid() = coach_id);

create policy "Coaches can update their own sessions"
  on public.sessions for update
  using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

-- Deliberately no delete policy: the app never hard-deletes a session, it
-- only sets status = 'cancelled' (see the update policy above), so booking
-- history is preserved. With no delete policy at all, a session cannot be
-- hard-deleted through the API even if a future bug tried to -- least
-- privilege, not just "the UI doesn't have a delete button".
