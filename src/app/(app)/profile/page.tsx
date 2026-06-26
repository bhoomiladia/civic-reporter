"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useIssues } from "@/hooks/use-issues";
import {
  Calendar,
  Settings,
  Bell,
  ChevronRight,
  LogOut,
  Shield,
  Award,
  FileText,
  Loader2,
  LogIn,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isLoading: authLoading, loginWithGoogle, logout, refreshProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'admin'>('citizen');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const handleSwitchRole = async () => {
    if (!user) return;
    setIsUpdatingRole(true);
    try {
      const { authApi } = await import("@/services/auth.api");
      const targetRole = user.role === 'admin' ? 'citizen' : 'admin';
      await authApi.updateProfile({ role: targetRole });
      await refreshProfile();
    } catch (err) {
      console.error("Failed to switch role:", err);
    } finally {
      setIsUpdatingRole(false);
    }
  };
  
  // Fetch only this user's issues from backend
  const { data: response, isLoading: issuesLoading } = useIssues({
    assignee: user?.id || undefined, // or reported by logic in repository
  });

  const isLoading = authLoading || issuesLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-secondary">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-body text-gray-500">Loading profile details...</p>
        </div>
      </div>
    );
  }

  // Not Logged In View
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <Card padding="lg" className="max-w-md w-full text-center shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-inner animate-pulse">
            <LogIn size={24} />
          </div>
          <h1 className="text-h2 text-gray-900 mb-2">Access Your Profile</h1>
          <p className="text-body text-gray-500 mb-6">
            Choose your role and sign in with Google to access reports, maps, and specific dashboards.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setSelectedRole('citizen')}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer",
                selectedRole === 'citizen'
                  ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm font-semibold"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              <Users size={20} className="mb-2" />
              <span className="text-small">Citizen</span>
              <span className="text-[10px] text-gray-400 mt-0.5">Report & vote</span>
            </button>
            <button
              onClick={() => setSelectedRole('admin')}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer",
                selectedRole === 'admin'
                  ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm font-semibold"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              <Shield size={20} className="mb-2" />
              <span className="text-small">Admin / Gov</span>
              <span className="text-[10px] text-gray-400 mt-0.5">Resolve & review</span>
            </button>
          </div>

          <Button className="w-full py-6 font-semibold" onClick={() => loginWithGoogle(selectedRole)}>
            Sign In with Google
          </Button>
        </Card>
      </div>
    );
  }

  // Filter issues reported by this citizen user if server didn't already segment
  const userIssues = response?.data?.filter((issue: any) => issue.reportedBy?.id === user.id) || [];
  const issuesReportedCount = userIssues.length;
  const issuesResolvedCount = userIssues.filter((issue: any) => issue.status === 'resolved').length;
  const resolutionRate = issuesReportedCount > 0 ? Math.round((issuesResolvedCount / issuesReportedCount) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xl">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-h2 text-gray-900">{user.name}</h1>
                <Badge variant="primary" className="text-[10px] py-0 uppercase">
                  {user.role}
                </Badge>
              </div>
              <p className="text-small text-gray-500 flex items-center gap-1 mt-1">
                <Calendar size={14} />
                Joined civic group
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card padding="md" className="text-center">
            <div className="text-h2 text-gray-900 mb-0.5">
              {issuesReportedCount}
            </div>
            <div className="text-small text-gray-500">Reported</div>
          </Card>
          <Card padding="md" className="text-center">
            <div className="text-h2 text-gray-900 mb-0.5">
              {issuesResolvedCount}
            </div>
            <div className="text-small text-gray-500">Resolved</div>
          </Card>
          <Card padding="md" className="text-center">
            <div className="text-h2 text-gray-900 mb-0.5">
              {resolutionRate}%
            </div>
            <div className="text-small text-gray-500">Rate</div>
          </Card>
        </div>

        {/* Your Issues */}
        <h2 className="text-h3 text-gray-900 mb-3 flex items-center gap-2">
          <FileText size={18} className="text-gray-400" />
          Your Reports
        </h2>
        <div className="space-y-2 mb-8">
          {userIssues.length > 0 ? (
            userIssues.map((issue: any) => (
              <Link key={issue.id} href={`/issues/${issue.id}`}>
                <Card hover padding="sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-small font-medium text-gray-900 truncate">
                        {issue.title}
                      </div>
                      <div className="text-[12px] text-gray-400 mt-0.5">
                        {issue.location.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Badge
                        variant={
                          issue.status === "resolved"
                            ? "success"
                            : issue.status === "in_progress"
                            ? "warning"
                            : "primary"
                        }
                        dot
                      >
                        {issue.status.replace("_", " ")}
                      </Badge>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <Card padding="lg" className="text-center">
              <p className="text-small text-gray-400">
                You haven&apos;t reported any issues yet.
              </p>
              <Link href="/report">
                <Button size="sm" className="mt-3">
                  Report Your First Issue
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Settings */}
        <h2 className="text-h3 text-gray-900 mb-3 flex items-center gap-2">
          <Settings size={18} className="text-gray-400" />
          Settings
        </h2>
        <Card padding="none">
          <div className="divide-y divide-gray-100">
            {[
              { icon: Bell, label: "Notifications", desc: "Manage alerts", onClick: undefined },
              { icon: Shield, label: "Privacy", desc: "Data and visibility", onClick: undefined },
              { icon: Award, label: "Achievements", desc: "Your badges", onClick: undefined },
              {
                icon: Shield,
                label: `Switch Role (Current: ${user.role})`,
                desc: isUpdatingRole ? "Updating..." : `Change role to ${user.role === 'admin' ? 'citizen' : 'admin'}`,
                onClick: handleSwitchRole,
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                disabled={isUpdatingRole}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                  <item.icon size={18} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-small font-medium text-gray-900">
                    {item.label}
                  </div>
                  <div className="text-[12px] text-gray-400">{item.desc}</div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            ))}
          </div>
        </Card>

        {/* Sign out */}
        <Button variant="ghost" className="w-full mt-6 text-gray-400 hover:text-red-600" onClick={() => logout()}>
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
