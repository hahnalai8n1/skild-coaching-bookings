import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const password = `Coachdesk-${randomUUID()}!`;
const runId = randomUUID();
const users = [];

function coachClient() {
  return createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function createCoach(label) {
  const email = `rls-${label}-${runId}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error(`Could not create ${label}: ${error?.message ?? "unknown error"}`);
  users.push(data.user.id);
  const client = coachClient();
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`Could not sign in ${label}: ${signInError.message}`);
  return { client, id: data.user.id };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log(`✓ ${message}`);
}

try {
  const coachA = await createCoach("a");
  const coachB = await createCoach("b");
  const startsAt = new Date(Date.now() + 86_400_000).toISOString();
  const endsAt = new Date(Date.now() + 90_000_000).toISOString();

  const { data: created, error: createError } = await coachA.client
    .from("sessions")
    .insert({ title: "RLS verification session", starts_at: startsAt, ends_at: endsAt })
    .select("id, coach_id, title")
    .single();
  if (createError || !created) throw new Error(`Coach A could not create a session: ${createError?.message}`);
  assert(created.coach_id === coachA.id, "the database assigns the authenticated coach as owner");

  const { data: visibleToB, error: readError } = await coachB.client.from("sessions").select("id").eq("id", created.id);
  if (readError) throw readError;
  assert(visibleToB.length === 0, "Coach B cannot read Coach A's session");

  const { data: changedByB, error: updateError } = await coachB.client
    .from("sessions")
    .update({ title: "Tampered" })
    .eq("id", created.id)
    .select("id");
  if (updateError) throw updateError;
  assert(changedByB.length === 0, "Coach B cannot update Coach A's session");

  const { data: unchanged, error: verifyError } = await coachA.client
    .from("sessions")
    .select("title")
    .eq("id", created.id)
    .single();
  if (verifyError) throw verifyError;
  assert(unchanged.title === "RLS verification session", "the blocked update leaves Coach A's data unchanged");

  const { error: forgedOwnerError } = await coachB.client.from("sessions").insert({
    coach_id: coachA.id,
    title: "Forged ownership",
    starts_at: startsAt,
    ends_at: endsAt,
  });
  assert(Boolean(forgedOwnerError), "Coach B cannot create a session owned by Coach A");

  console.log("\nRLS verification passed: coach data is isolated at the database layer.");
} catch (error) {
  console.error(`\nRLS verification failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  await Promise.all(users.map((id) => admin.auth.admin.deleteUser(id)));
}
