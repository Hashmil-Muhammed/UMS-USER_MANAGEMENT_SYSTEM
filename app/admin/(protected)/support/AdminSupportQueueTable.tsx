"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { SupportTicket, Profile } from "@/types/database";
import {
  SearchInput,
  Select,
  StatusBadge,
  Button,
  Pagination,
  EmptyState,
} from "@/components/ui";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  ArrowRight,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export interface TicketWithProfile extends SupportTicket {
  profile?: Profile | Profile[] | null;
}

export interface AdminSupportQueueTableProps {
  initialTickets: TicketWithProfile[];
}

export function AdminSupportQueueTable({
  initialTickets,
}: AdminSupportQueueTableProps) {
  const [tickets] = useState<TicketWithProfile[]>(initialTickets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter & Search
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const profile = Array.isArray(t.profile) ? t.profile[0] : t.profile;
      const submitterName = profile?.full_name?.toLowerCase() || "";
      const submitterEmail = profile?.email?.toLowerCase() || "";
      const searchLower = search.toLowerCase();

      const matchesSearch =
        t.ticket_number.toLowerCase().includes(searchLower) ||
        t.subject.toLowerCase().includes(searchLower) ||
        submitterName.includes(searchLower) ||
        submitterEmail.includes(searchLower);

      const matchesStatus =
        statusFilter === "all" || t.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || t.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [tickets, search, statusFilter, categoryFilter]);

  // Counts for quick filter pills
  const counts = useMemo(() => {
    return {
      all: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      in_progress: tickets.filter((t) => t.status === "in_progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
    };
  }, [tickets]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Quick Status Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            statusFilter === "all"
              ? "bg-blue-50/70 border-blue-200 ring-2 ring-blue-500/20"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 block">Total Tickets</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{counts.all}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter("open");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            statusFilter === "open"
              ? "bg-rose-50/70 border-rose-200 ring-2 ring-rose-500/20"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 block">Open</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{counts.open}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter("in_progress");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            statusFilter === "in_progress"
              ? "bg-amber-50/70 border-amber-200 ring-2 ring-amber-500/20"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 block">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{counts.in_progress}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter("resolved");
            setCurrentPage(1);
          }}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            statusFilter === "resolved"
              ? "bg-emerald-50/70 border-emerald-200 ring-2 ring-emerald-500/20"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 block">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{counts.resolved}</span>
        </button>
      </div>

      {/* Control Bar: Search & Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder="Search ticket #, subject, or submitter..."
          className="w-full md:w-80"
        />

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-48">
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: "All Categories" },
                { value: "Technical Issue", label: "Technical Issue" },
                { value: "Account Issue", label: "Account Issue" },
                { value: "General Query", label: "General Query" },
                { value: "Other", label: "Other" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {paginatedTickets.length === 0 ? (
          <EmptyState
            title="No support tickets match"
            description="Try adjusting your search query or removing category/status filters."
            action={
              (search || statusFilter !== "all" || categoryFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  Reset Queue Filters
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Ticket ID</th>
                  <th scope="col" className="px-6 py-4">Submitter</th>
                  <th scope="col" className="px-6 py-4">Category & Subject</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Submitted</th>
                  <th scope="col" className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTickets.map((ticket) => {
                  const profile = Array.isArray(ticket.profile)
                    ? ticket.profile[0]
                    : ticket.profile;

                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Ticket Number */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {ticket.ticket_number}
                        </span>
                      </td>

                      {/* Submitter */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {profile?.full_name?.charAt(0) || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {profile?.full_name || "User"}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {profile?.email || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Subject */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>{ticket.category}</span>
                        </div>
                        <p className="font-semibold text-slate-900 truncate text-sm">
                          {ticket.subject}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={ticket.status} size="sm" />
                      </td>

                      {/* Submission Date */}
                      <td className="px-6 py-4 text-xs text-slate-500" title={formatDate(ticket.created_at)}>
                        {formatRelativeTime(ticket.created_at)}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/support/${ticket.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                        >
                          View & Reply
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTickets.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      </div>
    </div>
  );
}
