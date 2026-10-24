import { createClient } from "@/lib/supabase/server";
import { Profile, Json } from "@/types/database";
import { redirect } from "next/navigation";

export interface CurrentUserSession {
  user: {
    id: string;
    email?: string;
  };
  profile: Profile;
}

/**
 * Retrieves the currently authenticated Supabase user and their public profile.
 * Returns null if not authenticated or if profile doesn't exist.
 */
export async function getCurrentUser(): Promise<CurrentUserSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
  };
}

/**
 * Server guard: Ensures user is authenticated and approved.
 * Redirects to /login if unauthenticated, or /account-status if pending/rejected/deactivated.
 */
export async function requireApprovedUser(): Promise<CurrentUserSession> {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  if (session.profile.account_status !== "approved") {
    redirect(`/account-status?status=${session.profile.account_status}`);
  }

  return session;
}

/**
 * Server guard: Ensures user is authenticated, approved, and has the 'admin' role.
 * Redirects to /admin/login if unauthenticated, or /user/dashboard if not an admin.
 */
export async function requireAdminUser(): Promise<CurrentUserSession> {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/admin/login");
  }

  if (session.profile.role !== "admin") {
    redirect("/user/dashboard");
  }

  if (session.profile.account_status !== "approved") {
    redirect(`/account-status?status=${session.profile.account_status}`);
  }

  return session;
}

/**
 * Reusable alias for requireAdminUser.
 */
export const requireAdmin = requireAdminUser;

/**
 * Helper to record activity log entry.
 */
export async function logActivity(params: {
  userId: string;
  action: string;
  actorId?: string;
  details?: Json;
}) {
  try {
    const supabase = await createClient();
    await supabase.from("activity_logs").insert({
      user_id: params.userId,
      actor_id: params.actorId || params.userId,
      action: params.action,
      details: params.details || {},
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

/**
 * Helper to create an in-app notification.
 */
export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    const supabase = await createClient();
    await supabase.from("notifications").insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      link: params.link,
      is_read: false,
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}
