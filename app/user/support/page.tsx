import React from "react";
import Link from "next/link";
import { requireApprovedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Button } from "@/components/ui";
import { SupportHistoryTable } from "./SupportHistoryTable";
import { PlusCircle } from "lucide-react";

export default async function UserSupportHistoryPage() {
  const session = await requireApprovedUser();
  const supabase = await createClient();

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support History"
        description="Review all submitted support queries, status updates, and administrator replies."
        actions={
          <Link href="/user/support/new">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              New Support Request
            </Button>
          </Link>
        }
      />

      <SupportHistoryTable initialTickets={tickets || []} />
    </div>
  );
}
