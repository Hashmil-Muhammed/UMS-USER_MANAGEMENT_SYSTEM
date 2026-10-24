import React from "react";
import { requireApprovedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { NotificationsList } from "./NotificationsList";

export default async function UserNotificationsPage() {
  const session = await requireApprovedUser();
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Notifications"
        description="Stay updated with ticket activity, account decisions, and system alerts."
      />

      <NotificationsList
        initialNotifications={notifications || []}
        userId={session.user.id}
      />
    </div>
  );
}
