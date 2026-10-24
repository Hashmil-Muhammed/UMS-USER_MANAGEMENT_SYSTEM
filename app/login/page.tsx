"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { Mail, Lock, Shield } from "lucide-react";

function LoginForm() {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    if (!isSupabaseConfigured()) {
      setGeneralError(
        "Supabase configuration is missing or incomplete. Please create a .env.local file with your actual NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable sign in."
      );
      return;
    }

    setIsLoading(true);

    try {
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

      // Fetch profile to verify role and account status
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, account_status")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        // Auth account exists but profile trigger has not finished or failed
        router.push("/account-status?status=pending");
        router.refresh();
        return;
      }

      const { role, account_status } = profile;

      // Handle account status
      if (account_status !== "approved") {
        router.push(`/account-status?status=${account_status}`);
        router.refresh();
        return;
      }

      // Ensure administrator accounts are routed to Admin Portal, not User Panel
      if (role === "admin") {
        router.push("/admin/dashboard");
        router.refresh();
        return;
      }

      // Standard approved user
      router.push(redirectTo || "/user/dashboard");
      router.refresh();
    } catch (err: unknown) {
      console.error("Login error:", err);
      setGeneralError(getAuthErrorMessage(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-4">
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
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-500 transition"
          >
            Create one
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-slate-200 sm:px-10">
          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            {generalError && (
              <AlertMessage
                type="error"
                message={generalError}
                onClose={() => setGeneralError(null)}
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={isLoading}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              disabled={isLoading}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Are you an administrator?</span>
              <Link
                href="/admin/login"
                className="font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Portal Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
