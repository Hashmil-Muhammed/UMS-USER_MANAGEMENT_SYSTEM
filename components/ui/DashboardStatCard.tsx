import React from "react";
import { cn } from "@/lib/utils";

export interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  colorScheme?: "blue" | "emerald" | "amber" | "purple" | "rose" | "slate";
  className?: string;
}

export function DashboardStatCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  colorScheme = "blue",
  className,
}: DashboardStatCardProps) {
  const iconBgClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border",
            iconBgClasses[colorScheme]
          )}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </h3>
        {trend && (
          <span
            className={cn(
              "text-xs font-semibold",
              trend.isPositive ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}
