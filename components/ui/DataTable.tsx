import React from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyTitle = "No records found",
  emptyDescription = "There are no records to display at this time.",
  isLoading = false,
  className,
}: DataTableProps<T>) {
  if (data.length === 0 && !isLoading) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className="my-6"
      />
    );
  }

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={cn(
                    "px-4 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="transition-colors hover:bg-slate-50/80"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn(
                      "px-4 py-3.5 text-slate-700 whitespace-nowrap",
                      col.className
                    )}
                  >
                    {col.cell
                      ? col.cell(row)
                      : col.accessorKey
                      ? String(row[col.accessorKey] ?? "")
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
