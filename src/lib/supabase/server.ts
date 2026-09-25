import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Supabase client for use in Server Components, Server Actions and Route
 * Handlers. It reads the user's session from cookies, so every query it
 * makes carries that user's JWT -- which is what RLS policies check against
 * with auth.uid(). This client uses the anon key, never the service role
 * key, so RLS is always enforced, even on the server.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component that can't set cookies -- safe
            // to ignore because the middleware below refreshes the session
            // on every request anyway.
          }
        },
      },
    },
  );
}
