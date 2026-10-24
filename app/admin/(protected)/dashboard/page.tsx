import React from "react";
import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  PageHeader,
  DashboardStatCard,
  StatusBadge,
  EmptyState,
} from "@/components/ui";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  ShieldAlert,
  LifeBuoy,
  CheckCircle2,
  ArrowRight,
  Shield,
  Activity,
  AlertCircle,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await requireAdminUser();
  const supabase = await createClient();

  // 1. Live User Statistics
  const [
    { count: totalUsers },
    { count: pendingUsers },
    { count: approvedUsers },
    { count: rejectedUsers },
    { count: deactivatedUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("account_status", "pending"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("account_status", "approved"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("account_status", "rejected"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("account_status", "deactivated"),
  ]);

  // 2. Live Support Ticket Statistics
  const [
    { count: totalTickets },
    { count: openTickets },
    { count: inProgressTickets },
    { count: resolvedTickets },
  ] = await Promise.all([
    supabase.from("support_tickets").select("*", { count: "exact", head: true }),
    supabase
      .from("support_tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("support_tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_progress"),
    supabase
      .from("support_tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved"),
  ]);

  // 3. Recent Registrations (latest 5)
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, account_status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // 4. Recent Support Tickets (latest 5)
  const { data: recentTickets } = await supabase
    .from("support_tickets")
    .select(`
      id,
      ticket_number,
      subject,
      category,
      status,
      created_at,
      profile:profiles (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  // 5. Recent Activity Logs (latest 5)
  const { data: recentActivity } = await supabase
    .from("activity_logs")
    .select("id, action, details, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Administrative Overview"
        description={`Welcome back, ${session.profile.full_name}. Real-time user metrics, approval pipelines, and support requests.`}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Users className="w-4 h-4" />
              Manage Users
            </Link>
            <Link
              href="/admin/support"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <LifeBuoy className="w-4 h-4" />
              Support Queue
            </Link>
          </div>
        }
      />

      {/* User Status Metrics Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          User Account Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <DashboardStatCard
            title="Total Users"
            value={totalUsers || 0}
            icon={<Users className="w-5 h-5 text-blue-600" />}
            subtitle="All registered accounts"
            colorScheme="blue"
          />

          <DashboardStatCard
            title="Pending Review"
            value={pendingUsers || 0}
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            subtitle="Awaiting admin approval"
            colorScheme="amber"
            className={pendingUsers && pendingUsers > 0 ? "ring-2 ring-amber-500/30" : ""}
          />

          <DashboardStatCard
            title="Approved Users"
            value={approvedUsers || 0}
            icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
            subtitle="Active portal access"
            colorScheme="emerald"
          />

          <DashboardStatCard
            title="Rejected"
            value={rejectedUsers || 0}
            icon={<UserX className="w-5 h-5 text-rose-600" />}
            subtitle="Registration denied"
            colorScheme="rose"
          />

          <DashboardStatCard
            title="Deactivated"
            value={deactivatedUsers || 0}
            icon={<ShieldAlert className="w-5 h-5 text-slate-600" />}
            subtitle="Suspended accounts"
            colorScheme="slate"
          />
        </div>
      </div>

      {/* Support Ticket Metrics Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Support Operations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardStatCard
            title="Total Tickets"
            value={totalTickets || 0}
            icon={<LifeBuoy className="w-5 h-5 text-purple-600" />}
            subtitle="All submitted tickets"
            colorScheme="purple"
          />

          <DashboardStatCard
            title="Open Tickets"
            value={openTickets || 0}
            icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
            subtitle="Awaiting first staff response"
            colorScheme="rose"
            className={openTickets && openTickets > 0 ? "ring-2 ring-rose-500/20" : ""}
          />

          <DashboardStatCard
            title="In Progress"
            value={inProgressTickets || 0}
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            subtitle="Actively being handled"
            colorScheme="amber"
          />

          <DashboardStatCard
            title="Resolved"
            value={resolvedTickets || 0}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            subtitle="Successfully completed"
            colorScheme="emerald"
          />
        </div>
      </div>

      {/* Two Column Grid: Recent Users & Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registrations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">Recent Registrations</h3>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!recentUsers || recentUsers.length === 0 ? (
            <EmptyState
              title="No users registered yet"
              description="New user registrations will appear here for review."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.full_name}
                      </p>
                      {user.role === "admin" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={user.account_status} size="sm" />
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {formatRelativeTime(user.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Support Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Recent Support Queue</h3>
            </div>
            <Link
              href="/admin/support"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View queue
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!recentTickets || recentTickets.length === 0 ? (
            <EmptyState
              title="No support tickets"
              description="User support queries and technical requests will display here."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTickets.map((ticket) => {
                const profile = Array.isArray(ticket.profile)
                  ? ticket.profile[0]
                  : ticket.profile;

                return (
                  <Link
                    key={ticket.id}
                    href={`/admin/support/${ticket.id}`}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl px-2 -mx-2 transition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">
                          {ticket.ticket_number}
                        </span>
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {ticket.subject}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {profile?.full_name || "User"} • {ticket.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={ticket.status} size="sm" />
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent System Audit Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900">Recent Administrative Audit Events</h3>
        </div>

        {!recentActivity || recentActivity.length === 0 ? (
          <p className="text-xs text-slate-500">No recent audit logs recorded.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentActivity.map((log) => (
              <div
                key={log.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-800">{log.action}</span>
                  {log.details && typeof log.details === "object" && (
                    <span className="text-slate-500 ml-2 font-mono text-[11px]">
                      {JSON.stringify(log.details)}
                    </span>
                  )}
                </div>
                <span className="text-slate-400 shrink-0" title={formatDate(log.created_at)}>
                  {formatRelativeTime(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
