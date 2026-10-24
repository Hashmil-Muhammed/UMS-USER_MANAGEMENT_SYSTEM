import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Users,
  LifeBuoy,
  Bell,
  Activity,
  CheckCircle2,
  ArrowRight,
  Lock,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white/95 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="UMS Logo"
              width={36}
              height={36}
              className="w-9 h-9 object-contain"
              priority
            />
            <span className="font-bold text-lg tracking-tight text-slate-900">
              User Management System
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50"
            >
              <Lock className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-radial from-blue-50/70 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Enterprise-Grade Access Control & User Management
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-tight">
            Streamlined User Access & <br className="hidden sm:inline" />
            <span className="text-blue-600">Administrator Approval</span> Workflow
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Secure self-service registration, administrator review pipelines, integrated support ticketing, and complete audit tracking built with Next.js and Supabase.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-blue-700 transition active:scale-98"
            >
              Get Started — Register Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              Sign In to Your Account
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Supabase Row Level Security
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Granular Status Verification
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real-time Support Conversations
            </span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Core Capabilities
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Complete Dual-Panel Architecture
            </p>
            <p className="mt-3 text-base text-slate-600">
              Designed for enterprise security standards, separating standard user operations from administrative governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-100">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Approval Pipeline
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                New accounts start in a <span className="font-semibold text-amber-700">pending</span> state. Protected features are locked until an administrator reviews and approves the registration.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 border border-indigo-100">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Support Ticketing System
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Submit categorized requests with unique identifiers (e.g. <span className="font-mono text-xs font-semibold bg-slate-100 px-1 py-0.5 rounded">TKT-1001</span>), view replies, and preserve full chronological threads.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Strict Row Level Security
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Database-enforced isolation ensures users can access only their own tickets, messages, notifications, and profile details.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 border border-purple-100">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Real In-App Notifications
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Receive persistent notifications when registrations are approved, tickets change status, or administrators post replies.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 border border-rose-100">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Audit Activity Trail
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Every important user action — from profile edits to ticket creations — is recorded in an immutable database activity log.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-100">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Dedicated Admin Panel
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Administrators get an exclusive console with live dashboard metrics, user status management, and ticket resolution workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 py-8 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 User Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-900 transition">User Login</Link>
            <Link href="/register" className="hover:text-slate-900 transition">Register</Link>
            <Link href="/admin/login" className="hover:text-slate-900 transition">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
