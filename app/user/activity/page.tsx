import React from "react";
import { requireApprovedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  Activity,
  CheckCircle2,
  Clock,
  Shield,
  User,
  Info,
} from "lucide-react";

export default async function UserActivityPage() {
  const session = await requireApprovedUser();
  const supabase = await createClient();

  const { data: activityLogs } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "account registered":
        return <User className="w-4 h-4 text-blue-600" />;
      case "profile updated":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "account approved":
        return <Shield className="w-4 h-4 text-emerald-600" />;
      case "support request created":
        return <Clock className="w-4 h-4 text-purple-600" />;
      case "support reply sent":
      case "support reply received":
        return <Info className="w-4 h-4 text-indigo-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Account Activity"
        description="A transparent audit record of all significant security, profile, and support actions associated with your account."
      />

      {!activityLogs || activityLogs.length === 0 ? (
        <EmptyState
          icon={<Activity className="w-6 h-6" />}
          title="No activity recorded"
          description="Your security and activity history will be logged here as you interact with the system."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="p-5 flex items-start gap-4 hover:bg-slate-50/60 transition"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getActionIcon(log.action)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h4 className="text-sm font-semibold text-slate-900">
                      {log.action}
                    </h4>
                    <span className="text-xs text-slate-400">
                      {formatRelativeTime(log.created_at)} ({formatDate(log.created_at)})
                    </span>
                  </div>

                  {log.details && typeof log.details === "object" && (
                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                  {log.details && typeof log.details === "string" && (
                    <p className="mt-1.5 text-xs text-slate-600">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
