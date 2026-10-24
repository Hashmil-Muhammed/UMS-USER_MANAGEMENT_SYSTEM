import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireApprovedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui";
import { TicketConversationThread, MessageWithSender } from "./TicketConversationThread";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserTicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const session = await requireApprovedUser();
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch ticket and ensure user ownership
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (ticketError || !ticket) {
    notFound();
  }

  // 2. Fetch all messages in the conversation thread with sender details
  const { data: messages } = await supabase
    .from("support_messages")
    .select(`
      *,
      sender:profiles (
        id,
        full_name,
        email,
        role,
        account_status
      )
    `)
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/user/support"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Support History
        </Link>

        {/* Ticket Header Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                {ticket.ticket_number}
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                {ticket.category}
              </span>
            </div>

            <StatusBadge status={ticket.status} />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {ticket.subject}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Submitted: {formatDate(ticket.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Last Updated: {formatRelativeTime(ticket.updated_at)}
            </span>
          </div>

          {/* Original Issue Description */}
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Initial Issue Description
            </span>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>
          </div>
        </div>
      </div>

      {/* Conversation Thread */}
      <TicketConversationThread
        ticket={ticket}
        initialMessages={(messages as MessageWithSender[]) || []}
        currentUserId={session.user.id}
      />
    </div>
  );
}
