import React from "react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Notification } from "@/types/database";
import { Bell, Check } from "lucide-react";

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  className?: string;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  className,
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border transition-all",
        notification.is_read
          ? "bg-white border-slate-200 text-slate-700"
          : "bg-blue-50/40 border-blue-200/70 text-slate-900 shadow-2xs",
        className
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
          notification.is_read
            ? "bg-slate-100 text-slate-500"
            : "bg-blue-100 text-blue-600"
        )}
      >
        <Bell className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              "text-sm font-semibold truncate",
              notification.is_read ? "text-slate-800" : "text-blue-950 font-bold"
            )}
          >
            {notification.title}
          </h4>
          <span className="text-xs text-slate-400 shrink-0">
            {formatRelativeTime(notification.created_at)}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
          {notification.message}
        </p>
      </div>

      {!notification.is_read && onMarkAsRead && (
        <button
          type="button"
          onClick={() => onMarkAsRead(notification.id)}
          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-100 transition cursor-pointer"
          title="Mark as read"
          aria-label="Mark as read"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
