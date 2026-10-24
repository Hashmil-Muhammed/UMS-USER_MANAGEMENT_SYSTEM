"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import {
  Button,
  Input,
  AlertMessage,
  StatusBadge,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Lock,
  Save,
} from "lucide-react";

export interface ProfileFormProps {
  initialProfile: Profile;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [department, setDepartment] = useState(initialProfile.department || "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) {
      errs.fullName = "Full name cannot be blank";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      // 1. Update permitted profile fields only
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          department: department.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", initialProfile.id);

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      // 2. Insert audit activity log
      await supabase.from("activity_logs").insert({
        user_id: initialProfile.id,
        actor_id: initialProfile.id,
        action: "Profile Updated",
        details: {
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          department: department.trim() || null,
        },
      });

      setSuccessMessage("Your profile information has been successfully updated.");
      router.refresh();
    } catch (err: unknown) {
      console.error("Profile update error:", err);
      setErrorMessage(
        "An unexpected error occurred while saving your profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <AlertMessage
          type="success"
          title="Changes Saved"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {errorMessage && (
        <AlertMessage
          type="error"
          title="Update Failed"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <form onSubmit={handleUpdate} className="space-y-6" noValidate>
        {/* Editable Information Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Personal Information
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Update your display name, contact phone, and organizational department.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div className="sm:col-span-2">
              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                disabled={isLoading}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
            </div>

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="Optional contact number"
            />

            <Input
              label="Department / Team"
              type="text"
              placeholder="Engineering, Operations, etc."
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isLoading}
              leftIcon={<Building className="w-4 h-4" />}
              helperText="Optional department name"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </div>

        {/* Read-Only Account Security & Audit Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                Account Attributes (Managed by Administrator)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                These core identity and governance attributes cannot be edited directly by users.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">
                Registered Email Address
              </span>
              <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                {initialProfile.email}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">
                Account Status
              </span>
              <div className="mt-0.5">
                <StatusBadge status={initialProfile.account_status} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">
                Assigned Role
              </span>
              <div className="mt-0.5">
                <StatusBadge status={initialProfile.role} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block mb-1">
                Registration Date
              </span>
              <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                {formatDate(initialProfile.created_at)}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
