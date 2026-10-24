import React from "react";
import { requireAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/layout";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminUser();
  const supabase = await createClient();

  // Query pending approvals for admin badge
  const { count: pendingCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("account_status", "pending");

  return (
    <DashboardLayout
      role="admin"
      userProfile={session.profile}
      unreadNotificationsCount={pendingCount || 0}
    >
      {children}
    </DashboardLayout>
  );
}
