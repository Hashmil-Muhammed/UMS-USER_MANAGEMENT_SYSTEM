import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

// Server-only Admin Client with service_role key
// Used exclusively for administrative operations (such as deleting auth users)
// NEVER import this in client-side components!
export function createAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://placeholder-project.supabase.co";
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    "placeholder-service-role-key";

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
