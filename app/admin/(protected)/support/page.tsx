import React from "react";
import { requireAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { AdminSupportQueueTable } from "./AdminSupportQueueTable";

export default async function AdminSupportPage() {
  await requireAdminUser();
  const supabase = await createClient();

  // Query all support tickets across all users joined with profiles
  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select(`
      *,
      profile:profiles (*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch admin support tickets:", error);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Ticket Administration"
        description="Monitor, triage, and reply to user inquiries, account issues, and technical support requests."
      />

      <AdminSupportQueueTable initialTickets={tickets || []} />
    </div>
  );
}
