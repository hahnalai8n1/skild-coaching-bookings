-- Cancellation is the only way a session leaves the schedule, so the database
-- should not allow history to be hard-deleted or rewritten after the fact.

-- 1. No hard deletes. Without a DELETE policy RLS already filters every row out,
--    and revoking the privilege makes the intent explicit at the grant level too.
drop policy if exists "Coaches can delete their own sessions" on public.sessions;
revoke delete on public.sessions from anon, authenticated;

-- 2. Anonymous visitors have no business with this table at all.
revoke all on public.sessions from anon;

-- 3. Record when a session was cancelled.
alter table public.sessions add column cancelled_at timestamptz;

alter table public.sessions
  add constraint sessions_cancelled_at_matches_status
  check ((status = 'cancelled') = (cancelled_at is not null));

-- 4. Lifecycle rules that must hold no matter which client sends the request:
--    - a cancelled session is final (no edits, no un-cancelling);
--    - a session that has already finished cannot be cancelled;
--    - ownership and creation time never change.
create or replace function public.enforce_session_lifecycle()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.coach_id is distinct from old.coach_id then
    raise exception 'Session ownership cannot be changed' using errcode = 'check_violation';
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception 'Session creation time cannot be changed' using errcode = 'check_violation';
  end if;

  if old.status = 'cancelled' then
    raise exception 'Cancelled sessions cannot be changed' using errcode = 'check_violation';
  end if;

  if new.status = 'cancelled' then
    if old.ends_at <= now() then
      raise exception 'Sessions that have already finished cannot be cancelled' using errcode = 'check_violation';
    end if;
    new.cancelled_at = now();
  else
    new.cancelled_at = null;
  end if;

  return new;
end;
$$;

create trigger sessions_enforce_lifecycle
before update on public.sessions
for each row execute function public.enforce_session_lifecycle();

-- Inserts always start as scheduled; a client cannot create a pre-cancelled row
-- or backdate its audit timestamps.
create or replace function public.enforce_session_insert()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.status = 'scheduled';
  new.cancelled_at = null;
  new.created_at = now();
  new.updated_at = now();
  return new;
end;
$$;

create trigger sessions_enforce_insert
before insert on public.sessions
for each row execute function public.enforce_session_insert();
