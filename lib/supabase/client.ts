import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";

export { isSupabaseConfigured, getAuthErrorMessage } from "./config";

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://placeholder-project.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-anon-key";

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}

