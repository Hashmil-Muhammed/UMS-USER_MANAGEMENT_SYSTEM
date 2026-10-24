"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SupportTicket, SupportMessage, Profile, TicketStatus } from "@/types/database";
import {
  Button,
  Textarea,
  Select,
  StatusBadge,
  AlertMessage,
} from "@/components/ui";
import { updateTicketStatus, sendAdminReply } from "@/app/admin/actions";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  Send,
  Shield,
  Clock,
  RotateCcw,
} from "lucide-react";

export interface MessageWithSender extends SupportMessage {
  sender?: Profile | null;
}

export interface AdminTicketConversationThreadProps {
  ticket: SupportTicket;
  initialMessages: MessageWithSender[];
  currentAdminId: string;
}

export function AdminTicketConversationThread({
  ticket,
  initialMessages,
  currentAdminId,
}: AdminTicketConversationThreadProps) {
  const router = useRouter();

  const [currentStatus, setCurrentStatus] = useState<TicketStatus>(ticket.status);
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Status Change Handler
  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (newStatus === currentStatus) return;
    setIsUpdatingStatus(true);
    setFeedback(null);

    try {
      const res = await updateTicketStatus(ticket.id, newStatus);
      if (!res.success) {
        setFeedback({ type: "error", message: res.error || "Failed to update ticket status." });
        return;
      }

      setCurrentStatus(newStatus);
      setFeedback({
        type: "success",
        message: `Ticket status successfully updated to ${newStatus.replace("_", " ").toUpperCase()}.`,
      });
      router.refresh();
    } catch (err: unknown) {
      console.error("Status update error:", err);
      setFeedback({ type: "error", message: "Unexpected server error while updating status." });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Staff Reply Handler
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSending(true);
    setFeedback(null);

    try {
      const res = await sendAdminReply(ticket.id, replyText.trim());
      if (!res.success) {
        setFeedback({ type: "error", message: res.error || "Failed to send staff response." });
        return;
      }

      // Optimistically append message
      const optimisticMessage: MessageWithSender = {
        id: "temp-" + Date.now(),
        ticket_id: ticket.id,
        sender_id: currentAdminId,
        message: replyText.trim(),
        created_at: new Date().toISOString(),
        sender: {
          id: currentAdminId,
          full_name: "Support Specialist",
          email: "support@ums.internal",
          role: "admin",
          account_status: "approved",
          phone: null,
          department: "Technical Support",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setReplyText("");

      if (currentStatus === "open") {
        setCurrentStatus("in_progress");
      }

      setFeedback({ type: "success", message: "Reply sent and user notified successfully." });
      router.refresh();
    } catch (err: unknown) {
      console.error("Staff reply error:", err);
      setFeedback({ type: "error", message: "Unexpected server error while posting reply." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {feedback && (
        <AlertMessage
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Admin Status Management Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Current Status:
          </span>
          <StatusBadge status={currentStatus} />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-600 shrink-0">
            Modify Status:
          </label>
          <div className="w-44">
            <Select
              value={currentStatus}
              disabled={isUpdatingStatus}
              onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
              options={[
                { value: "open", label: "Open (Pending)" },
                { value: "in_progress", label: "In Progress" },
                { value: "resolved", label: "Resolved" },
              ]}
            />
          </div>

          {currentStatus === "resolved" && (
            <Button
              size="sm"
              variant="outline"
              disabled={isUpdatingStatus}
              onClick={() => handleStatusChange("in_progress")}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Reopen
            </Button>
          )}
        </div>
      </div>

      {/* Conversation Thread History */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
          Ticket Conversation Thread ({messages.length})
        </h3>

        {messages.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            No messages recorded for this ticket yet.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isAdmin = msg.sender?.role === "admin";
              const isCurrentAdmin = msg.sender_id === currentAdminId;

              return (
                <div
                  key={msg.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isAdmin
                      ? "bg-blue-50/60 border-blue-200/90 shadow-2xs ml-4 sm:ml-8"
                      : "bg-white border-slate-200 mr-4 sm:mr-8"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs uppercase shadow-2xs ${
                        isAdmin
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isAdmin ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        msg.sender?.full_name?.charAt(0) || "U"
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {msg.sender?.full_name || (isAdmin ? "Support Specialist" : "User")}
                          </span>
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                              Support Staff {isCurrentAdmin && "(You)"}
                            </span>
                          ) : (
                            <span className="inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              Ticket Owner
                            </span>
                          )}
                        </div>

                        <span
                          className="text-xs text-slate-400"
                          title={formatDate(msg.created_at)}
                        >
                          {formatRelativeTime(msg.created_at)}
                        </span>
                      </div>

                      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Staff Reply Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Post Official Support Response
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            User will receive an immediate notification
          </span>
        </div>

        <form onSubmit={handleSendReply} className="space-y-4">
          <Textarea
            placeholder="Type your official administrative reply or technical guidance here..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={isSending}
            rows={4}
            required
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Posting this reply automatically sets status to &quot;In Progress&quot; if open.</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSending}
              disabled={!replyText.trim()}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send Staff Response
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
