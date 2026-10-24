import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export interface AlertMessageProps {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export function AlertMessage({
  type = "info",
  title,
  message,
  onClose,
  className,
}: AlertMessageProps) {
  const configs = {
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-800",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-800",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-200 text-blue-800",
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
  };

  const current = configs[type];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border shadow-xs transition-all",
        current.bg,
        className
      )}
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1 text-sm">
        {title && <h5 className="font-semibold leading-5 mb-0.5">{title}</h5>}
        <div className="text-sm opacity-90">{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-current/20 cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
