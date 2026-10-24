"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { SupportTicket } from "@/types/database";
import {
  DataTable,
  StatusBadge,
  SearchInput,
  Pagination,
} from "@/components/ui";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { ExternalLink, Filter } from "lucide-react";

export interface SupportHistoryTableProps {
  initialTickets: SupportTicket[];
}

export function SupportHistoryTable({
  initialTickets,
}: SupportHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter tickets by search and status
  const filteredTickets = useMemo(() => {
    return initialTickets.filter((t) => {
      const matchesSearch =
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [initialTickets, searchTerm, statusFilter]);

  // Paginated subset
  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <SearchInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by ID, subject, category..."
          className="w-full sm:w-72"
        />

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {["all", "open", "in_progress", "resolved"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusFilterChange(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer capitalize shrink-0 ${
                statusFilter === status
                  ? "bg-blue-600 text-white font-semibold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {status === "all" ? "All Tickets" : status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Data Table */}
      <DataTable<SupportTicket>
        data={paginatedTickets}
        keyExtractor={(ticket) => ticket.id}
        emptyTitle="No support requests found"
        emptyDescription={
          searchTerm || statusFilter !== "all"
            ? "No tickets match your search criteria. Try clearing filters."
            : "You haven't submitted any support requests yet."
        }
        columns={[
          {
            header: "Ticket ID",
            cell: (ticket) => (
              <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                {ticket.ticket_number}
              </span>
            ),
          },
          {
            header: "Subject & Category",
            cell: (ticket) => (
              <div className="max-w-xs sm:max-w-md">
                <Link
                  href={`/user/support/${ticket.id}`}
                  className="font-semibold text-slate-900 hover:text-blue-600 truncate block transition"
                >
                  {ticket.subject}
                </Link>
                <span className="text-xs text-slate-500 font-medium">
                  {ticket.category}
                </span>
              </div>
            ),
          },
          {
            header: "Status",
            cell: (ticket) => <StatusBadge status={ticket.status} size="sm" />,
          },
          {
            header: "Submitted",
            cell: (ticket) => (
              <span className="text-xs text-slate-500" title={formatDate(ticket.created_at)}>
                {formatRelativeTime(ticket.created_at)}
              </span>
            ),
          },
          {
            header: "Last Activity",
            cell: (ticket) => (
              <span className="text-xs text-slate-500" title={formatDate(ticket.updated_at)}>
                {formatRelativeTime(ticket.updated_at)}
              </span>
            ),
          },
          {
            header: "Action",
            className: "text-right",
            cell: (ticket) => (
              <Link
                href={`/user/support/${ticket.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition"
              >
                View Details
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            ),
          },
        ]}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredTickets.length}
        pageSize={pageSize}
      />
    </div>
  );
}
