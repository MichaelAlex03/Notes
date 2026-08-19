// `import "server-only"` is a build-time tripwire: if any code that ends up in
// the browser bundle imports this file, the build FAILS. This protects the
// service-role secret below, which must never reach the client. Note: it only
// works as an `import` — a bare "server-only" string does nothing.
import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Admin client — uses the SERVICE ROLE secret, which bypasses Row Level
// Security (full read/write/delete on every table). Server-only, no exceptions:
// if this key reaches the browser it can be read straight from the JS bundle and
// used to take over the entire database. The env var has no NEXT_PUBLIC_ prefix
// on purpose, so Next never inlines it into client code.
//
// auth options: this client carries no user session — the key IS the credential.
//   persistSession: false   → nothing to save to storage
//   autoRefreshToken: false → a per-request server client is too short-lived for
//                             the background refresh timer to ever matter
export const supabaseAdmin = createClient<Database>(
  process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_LOCAL_SUPABASE_URL! : process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NODE_ENV === 'development' ? process.env.LOCAL_SUPABASE_SERVICE_ROLE_KEY! : process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
