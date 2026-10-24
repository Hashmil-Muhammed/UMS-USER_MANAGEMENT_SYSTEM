"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TicketCategory } from "@/types/database";
import {
  Button,
  Input,
  Select,
  Textarea,
  AlertMessage,
  PageHeader,
} from "@/components/ui";
import { ArrowLeft, Send } from "lucide-react";

const CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: "Technical Issue", label: "Technical Issue" },
  { value: "Account Issue", label: "Account Issue" },
  { value: "General Query", label: "General Query" },
  { value: "Other", label: "Other" },
];

export default function NewSupportRequestPage() {
  const router = useRouter();
  const supabase = createClient();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<TicketCategory>("Technical Issue");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!subject.trim()) {
      errs.subject = "Subject is required";
    } else if (subject.trim().length < 5) {
      errs.subject = "Subject must be at least 5 characters";
    }
    if (!category) {
      errs.category = "Please select a category";
    }
    if (!description.trim()) {
      errs.description = "Description is required";
    } else if (description.trim().length < 10) {
      errs.description = "Please provide more details (at least 10 characters)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      // 1. Get authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setGeneralError("Authentication session expired. Please log in again.");
        setIsLoading(false);
        return;
      }

      // 2. Insert into support_tickets table
      // The trigger `trigger_set_ticket_number` will auto-generate ticket_number (e.g. TKT-1001)
      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: subject.trim(),
          category,
          description: description.trim(),
          status: "open",
        })
        .select()
        .single();

      if (ticketError || !ticket) {
        setGeneralError(
          ticketError?.message || "Failed to create support ticket."
        );
        setIsLoading(false);
        return;
      }

      // 3. Insert the initial message into support_messages
      await supabase.from("support_messages").insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        message: description.trim(),
      });

      // 4. Log activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        actor_id: user.id,
        action: "Support Request Created",
        details: {
          ticket_id: ticket.id,
          ticket_number: ticket.ticket_number,
          subject: ticket.subject,
          category: ticket.category,
        },
      });

      // 5. Create confirmation notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Support Request Created",
        message: `Your request (${ticket.ticket_number}) has been submitted and is currently open for review.`,
        link: `/user/support/${ticket.id}`,
      });

      // Redirect to ticket conversation page
      router.push(`/user/support/${ticket.id}`);
      router.refresh();
    } catch (err: unknown) {
      console.error("Support ticket submission error:", err);
      setGeneralError(
        "An unexpected error occurred while submitting your support ticket. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <Link
          href="/user/support"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Support History
        </Link>
        <PageHeader
          title="Create Support Request"
          description="Provide details regarding the issue or question you have. Our team will review and reply as soon as possible."
        />
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {generalError && (
            <AlertMessage
              type="error"
              message={generalError}
              onClose={() => setGeneralError(null)}
            />
          )}

          <Input
            label="Subject"
            type="text"
            placeholder="Brief summary of your query or issue"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={errors.subject}
            disabled={isLoading}
            required
          />

          <Select
            label="Issue Category"
            options={CATEGORIES}
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory)}
            error={errors.category}
            disabled={isLoading}
            required
          />

          <Textarea
            label="Detailed Description"
            placeholder="Please describe what you are experiencing, include any relevant error messages or steps to reproduce..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            disabled={isLoading}
            rows={6}
            required
          />

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800 mb-1">
              What happens next?
            </p>
            Your ticket will receive a unique tracking ID and start in the <span className="font-semibold text-blue-700">Open</span> status. An administrator will review your description, update the progress, and post replies in your ticket conversation thread.
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Link href="/user/support">
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit Ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
