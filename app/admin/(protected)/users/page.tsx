import React from "react";
import { requireAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { UsersManagementTable } from "./UsersManagementTable";

export default async function AdminUsersPage() {
  const session = await requireAdminUser();
  const supabase = await createClient();

  // Query all registered users from the database
  const { data: users, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to query users:", error);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management Console"
        description="Review pending account registrations, enforce status transitions, and administer active user profiles."
      />

      <UsersManagementTable
        initialUsers={users || []}
        currentAdminId={session.user.id}
      />
    </div>
  );
}
