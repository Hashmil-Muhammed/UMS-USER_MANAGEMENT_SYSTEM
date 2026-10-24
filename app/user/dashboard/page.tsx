import React from "react";
import Link from "next/link";
import { requireApprovedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  PageHeader,
  DashboardStatCard,
  StatusBadge,
  EmptyState,
  Button,
} from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";
import {
  LifeBuoy,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Bell,
  Activity,
  User,
} from "lucide-react";

export default async function UserDashboardPage() {
  const session = await requireApprovedUser();
  const supabase = await createClient();
  const userId = session.user.id;

  // 1. Fetch support ticket counts
  const [
    { count: totalTickets },
    { count: openTickets },
    { count: inProgressTickets },
    { count: resolvedTickets },
  ] = await Promise.all([
    supabase
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "open"),
    supabase
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "in_progress"),
    supabase
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "resolved"),
  ]);

  // 2. Fetch recent support tickets (latest 4)
  const { data: recentTickets } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(4);

  // 3. Fetch recent notifications (latest 3)
  const { data: recentNotifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  // 4. Fetch recent activity logs (latest 4)
  const { data: recentActivity } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${session.profile.full_name}!`}
        description="Here is an overview of your active support requests, recent updates, and account status."
        badge={<StatusBadge status={session.profile.account_status} />}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/user/support/new">
              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                New Request
              </Button>
            </Link>
          </div>
        }
      />

      {/* Real Database Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardStatCard
          title="Total Requests"
          value={totalTickets ?? 0}
          icon={<LifeBuoy className="w-5 h-5" />}
          subtitle="All lifetime tickets submitted"
          colorScheme="blue"
        />
        <DashboardStatCard
          title="Open Requests"
          value={openTickets ?? 0}
          icon={<AlertCircle className="w-5 h-5" />}
          subtitle="Awaiting administrative review"
          colorScheme="amber"
        />
        <DashboardStatCard
          title="In Progress"
          value={inProgressTickets ?? 0}
          icon={<Clock className="w-5 h-5" />}
          subtitle="Currently being investigated"
          colorScheme="purple"
        />
        <DashboardStatCard
          title="Resolved"
          value={resolvedTickets ?? 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          subtitle="Successfully closed issues"
          colorScheme="emerald"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/user/support/new"
          className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 hover:shadow-xs transition group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition">
                Create Support Request
              </h4>
              <p className="text-xs text-slate-500">Submit a query or report an issue</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          href="/user/support"
          className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 hover:shadow-xs transition group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                Support History
              </h4>
              <p className="text-xs text-slate-500">Track and view ticket conversations</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          href="/user/profile"
          className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 hover:shadow-xs transition group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition">
                My Profile
              </h4>
              <p className="text-xs text-slate-500">View and update your personal info</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      {/* Main Content Split: Tickets vs Notifications & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Support Requests (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-blue-600" />
              Recent Support Requests
            </h3>
            <Link
              href="/user/support"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all ({totalTickets ?? 0})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!recentTickets || recentTickets.length === 0 ? (
            <EmptyState
              icon={<LifeBuoy className="w-6 h-6" />}
              title="No support requests yet"
              description="Have questions or facing an issue? Create a support request and an administrator will assist you."
              action={
                <Link href="/user/support/new">
                  <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                    Submit First Request
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/user/support/${ticket.id}`}
                  className="block p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {ticket.ticket_number}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {ticket.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {ticket.subject}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {ticket.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <StatusBadge status={ticket.status} size="sm" />
                      <span className="text-[11px] text-slate-400">
                        {formatRelativeTime(ticket.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Notifications & Activity (1 col) */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-600" />
                Recent Notifications
              </h3>
              <Link
                href="/user/notifications"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            {!recentNotifications || recentNotifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No notifications to display.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg border text-xs ${
                      n.is_read
                        ? "bg-slate-50/50 border-slate-100 text-slate-600"
                        : "bg-blue-50/40 border-blue-200/80 text-slate-900 font-medium"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold truncate">{n.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatRelativeTime(n.created_at)}
                      </span>
                    </div>
                    <p className="text-slate-500 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Activity Card */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-600" />
                Recent Activity
              </h3>
              <Link
                href="/user/activity"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Full audit
              </Link>
            </div>

            {!recentActivity || recentActivity.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No activity logs recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentActivity.map((act) => (
                  <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800">
                        {act.action}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatRelativeTime(act.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
