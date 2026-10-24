"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  LifeBuoy,
  Bell,
  Activity,
  Users,
  X,
  PlusCircle,
} from "lucide-react";

export interface SidebarProps {
  role: "user" | "admin";
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Sidebar({
  role,
  isOpen = false,
  onClose,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  const userNavigation = [
    { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { name: "My Profile", href: "/user/profile", icon: User },
    { name: "Support Requests", href: "/user/support", icon: LifeBuoy },
    { name: "Notifications", href: "/user/notifications", icon: Bell },
    { name: "Account Activity", href: "/user/activity", icon: Activity },
  ];

  const adminNavigation = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Support Tickets", href: "/admin/support", icon: LifeBuoy },
  ];

  const navItems = role === "admin" ? adminNavigation : userNavigation;

  const content = (
    <div className="flex h-full flex-col justify-between py-4">
      <div className="space-y-6">
        <div className="px-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {role === "admin" ? "Administration" : "User Portal"}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/user/dashboard" &&
                item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0",
                    isActive ? "text-blue-600" : "text-slate-400"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {role === "user" && (
        <div className="px-4 pt-4 border-t border-slate-100">
          <Link
            href="/user/support/new"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition"
          >
            <PlusCircle className="w-4 h-4" />
            New Support Request
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:block w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)]",
          className
        )}
      >
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-in fade-in">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
