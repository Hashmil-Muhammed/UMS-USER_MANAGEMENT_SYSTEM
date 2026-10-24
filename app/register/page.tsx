"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  createClient,
  isSupabaseConfigured,
  getAuthErrorMessage,
} from "@/lib/supabase/client";
import {
  Button,
  Input,
  AlertMessage,
  StatusBadge,
} from "@/components/ui";
import {
  User,
  Mail,
  Lock,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function RegisterPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) {
      errs.fullName = "Full name is required";
    }
    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please provide a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      errs.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    if (!isSupabaseConfigured()) {
      setGeneralError(
        "Supabase configuration is missing or incomplete. Please create a .env.local file with your actual NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable user registration."
      );
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            // Security: Role is never user-assignable; defaults to 'user' on trigger
          },
        },
      });

      if (error) {
        setGeneralError(getAuthErrorMessage(error));
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setGeneralError("Registration failed. No user record was returned by the authentication service.");
        setIsLoading(false);
        return;
      }

      setRegisteredEmail(email.trim());
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error("Registration error:", err);
      setGeneralError(getAuthErrorMessage(err));
    } finally {
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-500 transition"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-slate-200 sm:px-10">
          {isSuccess ? (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                <Clock className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Registration Submitted
                </h3>
                <div className="mt-2 flex justify-center">
                  <StatusBadge status="pending" />
                </div>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
                  Your account for <span className="font-semibold text-slate-900">{registeredEmail}</span> has been created with status <span className="font-semibold text-amber-700">Pending Approval</span>.
                  <br /><br />
                  In accordance with system policy, an administrator must approve your registration before you can access the User Dashboard and submit support requests.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/account-status?status=pending"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                >
                  Check Account Status
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5" noValidate>
              {generalError && (
                <AlertMessage
                  type="error"
                  message={generalError}
                  onClose={() => setGeneralError(null)}
                />
              )}

              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                disabled={isLoading}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

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
                helperText="Must be at least 6 characters"
                disabled={isLoading}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
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
                  Register Account
                </Button>
              </div>

              <div className="pt-2 text-center text-xs text-slate-400">
                <p>
                  By registering, you acknowledge that access requires administrator verification.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
