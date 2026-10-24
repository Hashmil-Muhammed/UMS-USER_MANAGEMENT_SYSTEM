import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { AdminTicketConversationThread } from "./AdminTicketConversationThread";
import {
  ArrowLeft,
  User,
  Phone,
  Building,
  Calendar,
  Tag,
  Shield,
} from "lucide-react";

interface AdminTicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTicketDetailPage({
  params,
}: AdminTicketDetailPageProps) {
  const session = await requireAdminUser();
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch ticket and submitter profile
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .select(`
      *,
      profile:profiles (*)
    `)
    .eq("id", id)
    .single();

  if (ticketError || !ticket) {
    notFound();
  }

  // 2. Fetch conversation messages
  const { data: messages, error: messagesError } = await supabase
    .from("support_messages")
    .select(`
      *,
      sender:profiles (*)
    `)
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Failed to load ticket messages:", messagesError);
  }

  const submitter = Array.isArray(ticket.profile)
    ? ticket.profile[0]
    : ticket.profile;

  return (
    <div className="space-y-6">
      {/* Back Navigation & Breadcrumb */}
      <div>
        <Link
          href="/admin/support"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Support Queue
        </Link>

        <PageHeader
          title={`${ticket.ticket_number}: ${ticket.subject}`}
          description={`Created by ${submitter?.full_name || "User"} on ${formatDate(ticket.created_at)}`}
          actions={
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Category:</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                <Tag className="w-3 h-3 text-slate-400" />
                {ticket.category}
              </span>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Description & Conversation Thread */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Original Inquiry Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Initial Issue Description
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Conversation Thread & Reply */}
          <AdminTicketConversationThread
            ticket={ticket}
            initialMessages={messages || []}
            currentAdminId={session.user.id}
          />
        </div>

        {/* Right Column (1 Col): Submitter Profile Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg uppercase">
                {submitter?.full_name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-900 truncate">
                  {submitter?.full_name || "User"}
                </h4>
                <p className="text-xs text-slate-500 truncate">{submitter?.email}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Status:</span>
                <StatusBadge status={submitter?.account_status || "pending"} size="sm" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Role:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                  {submitter?.role === "admin" ? (
                    <>
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      Admin
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      User
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {submitter?.department || "Unassigned"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {submitter?.phone || "None"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Ticket Opened:</span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(ticket.created_at)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/admin/users"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Inspect in User Console
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
