"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createClient,
  isSupabaseConfigured,
  getAuthErrorMessage,
} from "@/lib/supabase/client";
import {
  Button,
  Input,
  AlertMessage,
} from "@/components/ui";
import { Mail, Lock, Shield, ArrowLeft } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    if (!isSupabaseConfigured()) {
      setGeneralError(
        "Supabase configuration is missing or incomplete. Please configure your .env.local file."
      );
      return;
    }

    setIsLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setGeneralError(getAuthErrorMessage(error));
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setGeneralError("Authentication failed. No user record returned.");
        setIsLoading(false);
        return;
      }

      // 2. Fetch profile to verify admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, account_status")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setGeneralError(
          "Access Denied: Unable to verify administrator credentials in database."
        );
        setIsLoading(false);
        return;
      }

      // 3. Strict Role Verification: Must be 'admin'
      if (profile.role !== "admin") {
        await supabase.auth.signOut();
        setGeneralError(
          "Access Denied: Administrator privileges required. Your account does not have access to the Admin Portal."
        );
        setIsLoading(false);
        return;
      }

      // 4. Account Status Verification: Must be 'approved'
      if (profile.account_status !== "approved") {
        await supabase.auth.signOut();
        setGeneralError(
          `Access Denied: Your administrator account is currently ${profile.account_status}. Please contact the system owner.`
        );
        setIsLoading(false);
        return;
      }

      // 5. Successful Admin Login
      router.push(redirectTo || "/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error("Admin login error:", err);
      setGeneralError(getAuthErrorMessage(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Admin Portal Authentication
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Restricted administrative access. Authorization required.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-10">
          <form onSubmit={handleAdminLogin} className="space-y-5" noValidate>
            {generalError && (
              <AlertMessage
                type="error"
                message={generalError}
                onClose={() => setGeneralError(null)}
              />
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                disabled={isLoading}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                className="bg-slate-900/50 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Master Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                disabled={isLoading}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                className="bg-slate-900/50 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold shadow-md shadow-blue-600/30"
                isLoading={isLoading}
              >
                Sign In to Admin Portal
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <Link
                href="/login"
                className="font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to User Sign In
              </Link>
              <span className="text-slate-500">Security Definer Active</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
