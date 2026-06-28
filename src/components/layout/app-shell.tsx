"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { Loader2 } from "lucide-react";
import { AIAssistant } from "@/components/shared/ai-assistant";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/profile") {
      router.push("/profile");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-small text-gray-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  if (!user && pathname !== "/profile") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar />
      <BottomNav />
      <main className="lg:ml-[120px] pb-16 lg:pb-0">{children}</main>
      <AIAssistant />
    </div>
  );
}
