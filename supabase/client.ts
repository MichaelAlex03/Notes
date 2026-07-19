import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Public client factory — uses the PUBLISHABLE key, which is designed to be
// exposed. Safe to run anywhere (browser or server) and kept out of the
// server-only file so client components can import it.
//
// Pass a `jwt` (one you signed with the project JWT secret) to scope requests to
// that user — the `accessToken` callback is supabase-js's "bring your own auth"
// hook: it runs before each request and its return value is sent as the Bearer
// token, so RLS evaluates as that user. Omit `jwt` for anonymous/public access
// (RLS treats the request as `anon`).
//
// IMPORTANT: call this PER REQUEST with that request's JWT. Don't build one
// shared instance and reuse it across users — on the server a shared client
// handling concurrent requests would leak one user's token into another's.
export const supabaseClient = (jwt?: string) => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    jwt
      ? {
          accessToken: async () => jwt,
          auth: { persistSession: false, autoRefreshToken: false },
        }
      : undefined
  );
};


