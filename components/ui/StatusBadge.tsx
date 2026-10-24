import React from "react";
import { cn } from "@/lib/utils";
import { AccountStatus, TicketStatus, UserRole } from "@/types/database";

export interface StatusBadgeProps {
  status: AccountStatus | TicketStatus | UserRole | string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const getBadgeConfig = (statusStr: string) => {
    switch (statusStr.toLowerCase()) {
      // Account statuses
      case "approved":
        return {
          label: "Approved",
          classes: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dot-emerald-500",
        };
      case "pending":
        return {
          label: "Pending Approval",
          classes: "bg-amber-50 text-amber-700 border-amber-200/80 dot-amber-500",
        };
      case "rejected":
        return {
          label: "Rejected",
          classes: "bg-rose-50 text-rose-700 border-rose-200/80 dot-rose-500",
        };
      case "deactivated":
        return {
          label: "Deactivated",
          classes: "bg-slate-100 text-slate-700 border-slate-300 dot-slate-500",
        };

      // Ticket statuses
      case "open":
        return {
          label: "Open",
          classes: "bg-blue-50 text-blue-700 border-blue-200/80 dot-blue-500",
        };
      case "in_progress":
        return {
          label: "In Progress",
          classes: "bg-purple-50 text-purple-700 border-purple-200/80 dot-purple-500",
        };
      case "resolved":
        return {
          label: "Resolved",
          classes: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dot-emerald-500",
        };

      // User roles
      case "admin":
        return {
          label: "Admin",
          classes: "bg-indigo-50 text-indigo-700 border-indigo-200/80 dot-indigo-500",
        };
      case "user":
        return {
          label: "User",
          classes: "bg-slate-100 text-slate-700 border-slate-200 dot-slate-400",
        };

      default:
        return {
          label: statusStr,
          classes: "bg-slate-100 text-slate-700 border-slate-200 dot-slate-400",
        };
    }
  };

  const config = getBadgeConfig(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs select-none",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        config.classes.split(" ").slice(0, 3).join(" "),
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0",
          config.classes.split(" ").find((c) => c.startsWith("dot-"))?.replace("dot-", "bg-") ||
            "bg-current"
        )}
      />
      {config.label}
    </span>
  );
}
