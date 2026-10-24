"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge, Button } from "@/components/ui";
import { AccountStatus, Profile } from "@/types/database";
import {
  Clock,
  XCircle,
  ShieldAlert,
  RotateCcw,
  LogOut,
  ShieldCheck,
} from "lucide-react";

function AccountStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryStatus = (searchParams.get("status") || "pending") as AccountStatus;
  const supabase = createClient();

  const [status, setStatus] = useState<AccountStatus>(queryStatus);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const syncStatus = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
          setStatus(profile.account_status);

          if (profile.account_status === "approved") {
            router.push(
              profile.role === "admin" ? "/admin/dashboard" : "/user/dashboard"
            );
            router.refresh();
            return;
          }
        }
      }
    } catch (err) {
      console.error("Error refreshing status:", err);
    } finally {
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && mounted) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile && mounted) {
            setUserProfile(profile);
            setStatus(profile.account_status);

            if (profile.account_status === "approved") {
              router.push(
                profile.role === "admin" ? "/admin/dashboard" : "/user/dashboard"
              );
              router.refresh();
            }
          }
        }
      } catch (err) {
        console.error("Mount status check failed:", err);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const getStatusContent = () => {
    switch (status) {
      case "approved":
        return {
          icon: <ShieldCheck className="w-12 h-12 text-emerald-600" />,
          title: "Account Approved",
          description:
            "Your account is approved and active. You have full access to the User Management System.",
          badge: <StatusBadge status="approved" />,
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
        };
      case "rejected":
        return {
          icon: <XCircle className="w-12 h-12 text-rose-600" />,
          title: "Registration Request Denied",
          description:
            "Your registration request was reviewed by an administrator and has been rejected. In accordance with system security policies, access to user features has been restricted.",
          badge: <StatusBadge status="rejected" />,
          bgColor: "bg-rose-50",
          borderColor: "border-rose-200",
        };
      case "deactivated":
        return {
          icon: <ShieldAlert className="w-12 h-12 text-slate-600" />,
          title: "Account Deactivated",
          description:
            "Your account has been deactivated by a system administrator. Protected sessions and features are temporarily suspended. Please contact administrative support if you require reactivation.",
          badge: <StatusBadge status="deactivated" />,
          bgColor: "bg-slate-100",
          borderColor: "border-slate-300",
        };
      case "pending":
      default:
        return {
          icon: <Clock className="w-12 h-12 text-amber-600" />,
          title: "Awaiting Administrator Approval",
          description:
            "Thank you for registering. All new accounts require administrative verification before access to the User Dashboard and support features is granted. Please check back shortly.",
          badge: <StatusBadge status="pending" />,
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-6">
          <Image
            src="/logo.png"
            alt="UMS Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
            priority
          />
          <span className="font-bold text-xl tracking-tight text-slate-900">
            User Management System
          </span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-10 px-6 shadow-md rounded-2xl border border-slate-200 sm:px-10 text-center">
          <div
            className={`w-20 h-20 rounded-full ${content.bgColor} border ${content.borderColor} flex items-center justify-center mx-auto mb-5`}
          >
            {content.icon}
          </div>

          <div className="flex justify-center mb-3">{content.badge}</div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {content.title}
          </h2>

          {userProfile && (
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Account: {userProfile.full_name} ({userProfile.email})
            </p>
          )}

          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600 text-left leading-relaxed">
            {content.description}
          </div>

          <div className="mt-8 space-y-3">
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={() => syncStatus(true)}
              isLoading={isRefreshing}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Refresh Account Status
            </Button>

            <Button
              variant="secondary"
              className="w-full justify-center text-slate-700"
              onClick={handleSignOut}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500">
            Need immediate assistance?{" "}
            <Link
              href="/"
              className="font-semibold text-blue-600 hover:text-blue-500"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <AccountStatusContent />
    </Suspense>
  );
}
