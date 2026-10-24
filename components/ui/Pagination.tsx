"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null;
  const endItem =
    totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1 border-t border-slate-200",
        className
      )}
    >
      <div className="text-sm text-slate-500">
        {startItem && endItem && totalItems ? (
          <span>
            Showing <span className="font-medium text-slate-900">{startItem}</span> to{" "}
            <span className="font-medium text-slate-900">{endItem}</span> of{" "}
            <span className="font-medium text-slate-900">{totalItems}</span> results
          </span>
        ) : (
          <span>
            Page <span className="font-medium text-slate-900">{currentPage}</span> of{" "}
            <span className="font-medium text-slate-900">{totalPages}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="hidden sm:flex items-center gap-1 px-1">
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            // Only show first, last, and window around current
            if (
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1
            ) {
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "w-8 h-8 rounded-md text-xs font-medium transition-colors cursor-pointer",
                    currentPage === page
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {page}
                </button>
              );
            } else if (
              page === 2 && currentPage > 3 ||
              page === totalPages - 1 && currentPage < totalPages - 2
            ) {
              return (
                <span key={page} className="px-1 text-slate-400 text-xs">
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
