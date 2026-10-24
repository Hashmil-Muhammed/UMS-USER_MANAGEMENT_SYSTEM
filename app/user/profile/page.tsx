import React from "react";
import { requireApprovedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, StatusBadge } from "@/components/ui";
import { ProfileForm } from "./ProfileForm";
import { formatDate } from "@/lib/utils";

export default async function UserProfilePage() {
  const session = await requireApprovedUser();
  const supabase = await createClient();

  // Load fresh profile from database
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  const userProfile = profile || session.profile;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="My Profile"
        description="View and manage your personal account settings and verified system status."
      />

      {/* User Header Summary Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm uppercase">
            {userProfile.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {userProfile.full_name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{userProfile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={userProfile.account_status} size="sm" />
              <StatusBadge status={userProfile.role} size="sm" />
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 sm:text-right">
          <p>Member Since</p>
          <p className="font-semibold text-slate-800 mt-0.5">
            {formatDate(userProfile.created_at)}
          </p>
        </div>
      </div>

      {/* Interactive Profile Form */}
      <ProfileForm initialProfile={userProfile} />
    </div>
  );
}
