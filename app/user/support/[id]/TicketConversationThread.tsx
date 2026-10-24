"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  SupportTicket,
  SupportMessage,
  Profile,
} from "@/types/database";
import { Button, Textarea, AlertMessage } from "@/components/ui";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Send, Shield, CheckCircle2 } from "lucide-react";

export interface MessageWithSender extends SupportMessage {
  sender?: Profile | null;
}

export interface TicketConversationThreadProps {
  ticket: SupportTicket;
  initialMessages: MessageWithSender[];
  currentUserId: string;
}

export function TicketConversationThread({
  ticket,
  initialMessages,
  currentUserId,
}: TicketConversationThreadProps) {
  const router = useRouter();
  const supabase = createClient();

  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isResolved = ticket.status === "resolved";

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!replyText.trim()) return;

    setIsLoading(true);

    try {
      // 1. Insert new message
      const { data: newMessage, error: msgError } = await supabase
        .from("support_messages")
        .insert({
          ticket_id: ticket.id,
          sender_id: currentUserId,
          message: replyText.trim(),
        })
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
        .single();

      if (msgError) {
        setError(msgError.message);
        setIsLoading(false);
        return;
      }

      // 2. Update ticket updated_at
      await supabase
        .from("support_tickets")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticket.id);

      // 3. Log activity
      await supabase.from("activity_logs").insert({
        user_id: currentUserId,
        actor_id: currentUserId,
        action: "Support Reply Sent",
        details: {
          ticket_id: ticket.id,
          ticket_number: ticket.ticket_number,
        },
      });

      // Optimistic update
      setMessages((prev) => [...prev, newMessage as MessageWithSender]);
      setReplyText("");
      router.refresh();
    } catch (err: unknown) {
      console.error("Failed to send message:", err);
      setError("An unexpected error occurred while sending your reply.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Conversation Thread Messages */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
          Conversation History ({messages.length})
        </h3>

        {messages.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            No messages recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isAdmin = msg.sender?.role === "admin";
              const isCurrentUser = msg.sender_id === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 p-5 rounded-2xl border transition-all ${
                    isAdmin
                      ? "bg-blue-50/50 border-blue-200/90 shadow-2xs"
                      : "bg-white border-slate-200"
                  }`}
                >
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
                          {msg.sender?.full_name || (isCurrentUser ? "You" : "User")}
                        </span>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                            Support Staff
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
              );
            })}
          </div>
        )}
      </div>

      {/* Reply Input Area */}
      {isResolved ? (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold">This support request is resolved</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              If you are still experiencing difficulties, please submit a new support request.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900">
            Post a Reply
          </h4>

          {error && (
            <AlertMessage
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          <form onSubmit={handleSendReply} className="space-y-4">
            <Textarea
              placeholder="Type your message or response here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={isLoading}
              rows={4}
              required
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Messages are preserved in the ticket history.
              </span>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={!replyText.trim()}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Send Reply
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
