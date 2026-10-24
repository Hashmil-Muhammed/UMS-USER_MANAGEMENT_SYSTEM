import React from "react";
import { requireApprovedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/layout";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireApprovedUser();

  // If role is admin, redirect to admin portal
  if (session.profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  // Fetch unread notifications count
  const supabase = await createClient();
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.user.id)
    .eq("is_read", false);

  return (
    <DashboardLayout
      role="user"
      userProfile={session.profile}
      unreadNotificationsCount={unreadCount || 0}
    >
      {children}
    </DashboardLayout>
  );
}
