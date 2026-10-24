"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Profile } from "@/types/database";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  userProfile?: Profile | null;
  unreadNotificationsCount?: number;
  role: "user" | "admin";
}

export function DashboardLayout({
  children,
  userProfile,
  unreadNotificationsCount = 0,
  role,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar
        userProfile={userProfile}
        unreadNotificationsCount={unreadNotificationsCount}
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      <div className="flex flex-1">
        <Sidebar
          role={role}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
