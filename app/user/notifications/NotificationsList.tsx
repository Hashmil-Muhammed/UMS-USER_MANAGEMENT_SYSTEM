"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Notification } from "@/types/database";
import {
  NotificationItem,
  EmptyState,
  Button,
} from "@/components/ui";
import { Bell, CheckCheck } from "lucide-react";

export interface NotificationsListProps {
  initialNotifications: Notification[];
  userId: string;
}

export function NotificationsList({
  initialNotifications,
  userId,
}: NotificationsListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications
  );
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", userId);

      router.refresh();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    setIsMarkingAll(true);
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      router.refresh();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="w-6 h-6" />}
        title="No notifications"
        description="You have no notifications at this time. You'll receive updates when your tickets receive replies or your account status changes."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-900">
            {notifications.length} Total
          </span>
          <span>•</span>
          <span
            className={
              unreadCount > 0 ? "font-bold text-blue-600" : "text-slate-500"
            }
          >
            {unreadCount} Unread
          </span>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            isLoading={isMarkingAll}
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          >
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((item) => (
          <NotificationItem
            key={item.id}
            notification={item}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </div>
    </div>
  );
}
