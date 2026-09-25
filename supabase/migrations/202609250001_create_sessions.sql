-- Coaching sessions are owned by the authenticated coach who created them.
-- RLS is the security boundary; application-side filters are only a convenience.

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 2 and 80),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text check (location is null or char_length(location) <= 120),
  notes text check (notes is null or char_length(notes) <= 1000),
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sessions_end_after_start check (ends_at > starts_at)
);

create index sessions_coach_starts_at_idx on public.sessions (coach_id, starts_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sessions_set_updated_at
before update on public.sessions
for each row execute function public.set_updated_at();

alter table public.sessions enable row level security;

create policy "Coaches can view their own sessions"
on public.sessions
for select
to authenticated
using ((select auth.uid()) = coach_id);

create policy "Coaches can create their own sessions"
on public.sessions
for insert
to authenticated
with check ((select auth.uid()) = coach_id);

create policy "Coaches can update their own sessions"
on public.sessions
for update
to authenticated
using ((select auth.uid()) = coach_id)
with check ((select auth.uid()) = coach_id);

create policy "Coaches can delete their own sessions"
on public.sessions
for delete
to authenticated
using ((select auth.uid()) = coach_id);

comment on table public.sessions is
  'Private coaching sessions. Access is isolated per coach by PostgreSQL RLS.';
