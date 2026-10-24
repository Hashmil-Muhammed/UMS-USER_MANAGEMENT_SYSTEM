/**
 * Supabase configuration and authentication error handling helpers.
 *
 * Ensures robust error handling for missing environment variables, network
 * unreachable states, database trigger migration gaps, and auth constraints.
 */

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return false;
  }

  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (cleanUrl.length === 0 || cleanKey.length === 0) {
    return false;
  }

  // Detect unpopulated template placeholders
  const placeholderPatterns = [
    "placeholder-project",
    "your-supabase-project",
    "placeholder-anon",
    "your-supabase-anon",
    "your-project.supabase.co",
    "xyzcompany.supabase.co",
  ];

  for (const pattern of placeholderPatterns) {
    if (cleanUrl.includes(pattern) || cleanKey.includes(pattern)) {
      return false;
    }
  }

  // Validate URL protocol and format
  try {
    const parsed = new URL(cleanUrl);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function getAuthErrorMessage(error: unknown): string {
  if (!error) {
    return "An unknown error occurred. Please try again.";
  }

  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : String(error);

  const lower = message.toLowerCase();

  // Network / fetch / connectivity errors
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("fetch failed") ||
    lower.includes("network request failed") ||
    lower.includes("load failed") ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name: unknown }).name === "AuthRetryableFetchError")
  ) {
    return "Unable to connect to the authentication server. Please check your internet connection and verify that your Supabase project is active and reachable.";
  }

  // Duplicate user / email exists
  if (
    lower.includes("already registered") ||
    lower.includes("user already exists") ||
    lower.includes("unique constraint") ||
    lower.includes("already in use")
  ) {
    return "An account with this email address already exists. Please sign in instead.";
  }

  // Database trigger / migration failure (handle_new_user trigger in supabase/schema.sql)
  if (
    lower.includes("database error") ||
    lower.includes("error saving new user") ||
    lower.includes("violates foreign key") ||
    lower.includes("relation") ||
    lower.includes("trigger")
  ) {
    return "Account creation failed due to a database error. Please verify that the database tables and triggers in supabase/schema.sql have been executed in your Supabase SQL Editor.";
  }

  // Invalid login credentials
  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid email or password")
  ) {
    return "Invalid email address or password. Please verify your credentials and try again.";
  }

  // Email confirmation required
  if (
    lower.includes("email not confirmed") ||
    lower.includes("email address not confirmed")
  ) {
    return "Your email address has not been confirmed yet. Please check your inbox or disable email confirmation in your Supabase Auth settings.";
  }

  // Rate limit / abuse protection
  if (
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("over_email_send_rate_limit")
  ) {
    return "Too many requests. Please wait a few moments before trying again.";
  }

  // Password requirements
  if (
    lower.includes("password should be at least") ||
    lower.includes("weak password") ||
    lower.includes("password is too short")
  ) {
    return "Password must be at least 6 characters long.";
  }

  // Invalid email format from Supabase
  if (
    lower.includes("invalid email") ||
    lower.includes("email address is invalid")
  ) {
    return "Please enter a valid email address.";
  }

  return message;
}
