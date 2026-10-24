"use server";

import { requireAdminUser, logActivity, createNotification } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AccountStatus, TicketStatus } from "@/types/database";

export interface ActionResponse {
  success: boolean;
  error?: string;
}

/**
 * Server Action: Update a user's account status (approve, reject, deactivate, reactivate).
 */
export async function updateUserStatus(
  targetUserId: string,
  newStatus: AccountStatus
): Promise<ActionResponse> {
  const currentAdmin = await requireAdminUser();
  const supabase = await createClient();

  if (!["pending", "approved", "rejected", "deactivated"].includes(newStatus)) {
    return { success: false, error: "Invalid account status provided." };
  }

  // Prevent admin from deactivating or rejecting their own account
  if (targetUserId === currentAdmin.user.id && newStatus !== "approved") {
    return {
      success: false,
      error: "Administrators cannot deactivate, reject, or demote their own account.",
    };
  }

  // Fetch target user profile
  const { data: targetProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", targetUserId)
    .single();

  if (fetchError || !targetProfile) {
    return { success: false, error: "Target user profile not found." };
  }

  const previousStatus = targetProfile.account_status;

  // Update profile status
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      account_status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetUserId);

  if (updateError) {
    console.error("Failed to update user status:", updateError);
    return { success: false, error: updateError.message };
  }

  // Send contextual notification to the user
  let notificationTitle = "Account Status Updated";
  let notificationMessage = `Your account status has been changed to ${newStatus}.`;

  if (newStatus === "approved") {
    notificationTitle = "Account Approved";
    notificationMessage =
      "Your registration has been approved by an administrator. You now have full access to the User Portal.";
  } else if (newStatus === "rejected") {
    notificationTitle = "Registration Request Denied";
    notificationMessage =
      "Your registration request was reviewed and denied in accordance with system security policies.";
  } else if (newStatus === "deactivated") {
    notificationTitle = "Account Deactivated";
    notificationMessage =
      "Your account access has been temporarily deactivated by an administrator.";
  }

  await createNotification({
    userId: targetUserId,
    title: notificationTitle,
    message: notificationMessage,
    link: newStatus === "approved" ? "/user/dashboard" : "/account-status",
  });

  // Log activity
  await logActivity({
    userId: targetUserId,
    actorId: currentAdmin.user.id,
    action: `User Status Changed to ${newStatus}`,
    details: {
      admin_email: currentAdmin.user.email,
      target_email: targetProfile.email,
      previous_status: previousStatus,
      new_status: newStatus,
    },
  });

  return { success: true };
}

/**
 * Server Action: Permanently delete a user account and associated profile records.
 */
export async function deleteUser(targetUserId: string): Promise<ActionResponse> {
  const currentAdmin = await requireAdminUser();
  const supabase = await createClient();

  // Prevent self-deletion
  if (targetUserId === currentAdmin.user.id) {
    return {
      success: false,
      error: "You cannot delete your own administrator account.",
    };
  }

  // Fetch target profile
  const { data: targetProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", targetUserId)
    .single();

  if (fetchError || !targetProfile) {
    return { success: false, error: "Target user not found." };
  }

  // Safety: If deleting an administrator, ensure they are not the only one
  if (targetProfile.role === "admin") {
    const { count, error: countError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if (!countError && count !== null && count <= 1) {
      return {
        success: false,
        error: "Cannot delete the sole remaining administrator account in the system.",
      };
    }
  }

  // Record audit log before deletion
  await logActivity({
    userId: currentAdmin.user.id,
    actorId: currentAdmin.user.id,
    action: "User Account Deleted",
    details: {
      admin_email: currentAdmin.user.email,
      deleted_user_id: targetUserId,
      deleted_user_email: targetProfile.email,
      deleted_user_name: targetProfile.full_name,
    },
  });

  // Use server-side admin client to remove the auth.users record (which cascades)
  const adminClient = createAdminClient();
  const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(
    targetUserId
  );

  if (authDeleteError) {
    console.error("Auth delete error:", authDeleteError);
    // Attempt fallback delete on profiles table
    const { error: profileDeleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", targetUserId);

    if (profileDeleteError) {
      return {
        success: false,
        error: authDeleteError.message || profileDeleteError.message,
      };
    }
  } else {
    // Explicitly ensure profile is deleted if cascade did not trigger
    await supabase.from("profiles").delete().eq("id", targetUserId);
  }

  return { success: true };
}

/**
 * Server Action: Update support ticket status.
 */
export async function updateTicketStatus(
  ticketId: string,
  newStatus: TicketStatus
): Promise<ActionResponse> {
  const currentAdmin = await requireAdminUser();
  const supabase = await createClient();

  if (!["open", "in_progress", "resolved"].includes(newStatus)) {
    return { success: false, error: "Invalid ticket status." };
  }

  const { data: ticket, error: fetchError } = await supabase
    .from("support_tickets")
    .select("*, profile:profiles(*)")
    .eq("id", ticketId)
    .single();

  if (fetchError || !ticket) {
    return { success: false, error: "Support ticket not found." };
  }

  const previousStatus = ticket.status;

  const { error: updateError } = await supabase
    .from("support_tickets")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Notify ticket owner
  await createNotification({
    userId: ticket.user_id,
    title: `Ticket ${ticket.ticket_number} Updated`,
    message: `Your support ticket status has been changed to ${newStatus.replace("_", " ").toUpperCase()}.`,
    link: `/user/support/${ticket.id}`,
  });

  // Log activity
  await logActivity({
    userId: ticket.user_id,
    actorId: currentAdmin.user.id,
    action: `Support Ticket Status Changed to ${newStatus}`,
    details: {
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
      previous_status: previousStatus,
      new_status: newStatus,
      admin_email: currentAdmin.user.email,
    },
  });

  return { success: true };
}

/**
 * Server Action: Post a reply to a support ticket as Support Staff.
 */
export async function sendAdminReply(
  ticketId: string,
  message: string
): Promise<ActionResponse> {
  const currentAdmin = await requireAdminUser();
  const supabase = await createClient();

  if (!message.trim()) {
    return { success: false, error: "Reply message cannot be empty." };
  }

  // Fetch ticket details
  const { data: ticket, error: fetchError } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (fetchError || !ticket) {
    return { success: false, error: "Support ticket not found." };
  }

  // Insert support message
  const { error: insertError } = await supabase.from("support_messages").insert({
    ticket_id: ticketId,
    sender_id: currentAdmin.user.id,
    message: message.trim(),
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Update ticket timestamp; if open, automatically transition to in_progress
  const nextStatus = ticket.status === "open" ? "in_progress" : ticket.status;
  await supabase
    .from("support_tickets")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  // Notify ticket owner
  await createNotification({
    userId: ticket.user_id,
    title: `Support Staff Replied: ${ticket.ticket_number}`,
    message: `A support specialist responded to your ticket "${ticket.subject}".`,
    link: `/user/support/${ticket.id}`,
  });

  // Log activity
  await logActivity({
    userId: ticket.user_id,
    actorId: currentAdmin.user.id,
    action: "Support Staff Reply Sent",
    details: {
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
      admin_email: currentAdmin.user.email,
    },
  });

  return { success: true };
}
