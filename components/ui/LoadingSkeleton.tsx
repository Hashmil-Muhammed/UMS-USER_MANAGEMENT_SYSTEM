import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
}

export function LoadingSkeleton({
  className,
  variant = "rectangular",
  width,
  height,
}: LoadingSkeletonProps) {
  const variantStyles = {
    text: "h-4 rounded",
    rectangular: "rounded-lg",
    circular: "rounded-full",
  };

  return (
    <div
      style={{ width, height }}
      className={cn(
        "animate-pulse bg-slate-200/80",
        variantStyles[variant],
        className
      )}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3">
      <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-3 border-b border-slate-100">
          {Array.from({ length: cols }).map((_, j) => (
            <LoadingSkeleton
              key={j}
              className={cn("h-5", j === 0 ? "w-1/3" : "w-1/4")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-4 w-24" />
        <LoadingSkeleton variant="circular" className="h-8 w-8" />
      </div>
      <LoadingSkeleton className="h-8 w-16" />
      <LoadingSkeleton className="h-3 w-32" />
    </div>
  );
}
