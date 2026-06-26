"use client";

import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <BottomNav />
      <main className="lg:ml-[220px] pb-16 lg:pb-0">{children}</main>
    </div>
  );
}
