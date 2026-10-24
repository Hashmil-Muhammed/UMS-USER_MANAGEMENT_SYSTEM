"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import {
  Bell,
  LogOut,
  User,
  Menu,
  ChevronDown,
} from "lucide-react";
import { StatusBadge } from "@/components/ui";

export interface NavbarProps {
  userProfile?: Profile | null;
  unreadNotificationsCount?: number;
  onToggleSidebar?: () => void;
}

export function Navbar({
  userProfile,
  unreadNotificationsCount = 0,
  onToggleSidebar,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(userProfile?.role === "admin" ? "/admin/login" : "/login");
    router.refresh();
  };

  const isAdmin = userProfile?.role === "admin";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link
          href={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
          className="flex items-center gap-2.5 font-bold text-slate-900 tracking-tight text-lg"
        >
          <Image
            src="/logo.png"
            alt="UMS Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
            priority
          />
          <span>
            {isAdmin ? "Admin Portal" : "User Portal"}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {userProfile && (
          <>
            {/* Notification Bell */}
            <Link
              href={isAdmin ? "/admin/dashboard" : "/user/notifications"}
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs uppercase">
                  {userProfile.full_name?.charAt(0) || "U"}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {userProfile.full_name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {userProfile.email}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {userProfile.full_name}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <StatusBadge status={userProfile.role} size="sm" />
                        <StatusBadge status={userProfile.account_status} size="sm" />
                      </div>
                    </div>

                    {!isAdmin && (
                      <Link
                        href="/user/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
