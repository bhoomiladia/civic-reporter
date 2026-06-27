"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useIssues } from "@/hooks/use-issues";
import {
  Calendar,
  LogOut,
  Shield,
  Award,
  FileText,
  Loader2,
  LogIn,
  Users,
  Clock,
  CheckCircle,
  ThumbsUp,
  Activity,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isLoading: authLoading, loginWithGoogle, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"citizen" | "admin">("citizen");
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "verifications">("active");

  const { data: response, isLoading: issuesLoading } = useIssues({
    assignee: user?.id || undefined,
  });

  const isLoading = authLoading || issuesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50/50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-body text-gray-500">Loading your activity...</p>
        </div>
      </div>
    );
  }

  // Not Logged In View
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
        <Card padding="lg" className="max-w-md w-full text-center shadow-lg border-slate-100 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-inner">
            <LogIn size={24} />
          </div>
          <h1 className="text-h2 font-extrabold text-gray-900 mb-2">Access Your Activity</h1>
          <p className="text-body text-gray-500 mb-6">
            Choose your role and sign in to track your civic reports, verifications, and contribution achievements.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setSelectedRole("citizen")}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer",
                selectedRole === "citizen"
                  ? "border-blue-600 bg-blue-50/50 text-blue-700 font-semibold"
                  : "border-slate-100 bg-white text-gray-500 hover:bg-slate-50"
              )}
            >
              <Users size={20} className="mb-2" />
              <span className="text-small font-bold">Citizen</span>
              <span className="text-[10px] text-gray-400 mt-0.5">Report & track</span>
            </button>
            <button
              onClick={() => setSelectedRole("admin")}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer",
                selectedRole === "admin"
                  ? "border-blue-600 bg-blue-50/50 text-blue-700 font-semibold"
                  : "border-slate-100 bg-white text-gray-500 hover:bg-slate-50"
              )}
            >
              <Shield size={20} className="mb-2" />
              <span className="text-small font-bold">Admin</span>
              <span className="text-[10px] text-gray-400 mt-0.5">Manage & dispatch</span>
            </button>
          </div>

          <Button className="w-full py-6 font-semibold shadow-md" onClick={() => loginWithGoogle(selectedRole)}>
            Sign In with Google
          </Button>
        </Card>
      </div>
    );
  }

  // Filter user reports
  const userIssues = response?.data?.filter((issue: any) => issue.reportedBy?.id === user.id) || [];
  
  const activeReports = userIssues.filter(
    (issue: any) => issue.status !== "resolved" && issue.status !== "closed"
  );
  const completedReports = userIssues.filter(
    (issue: any) => issue.status === "resolved" || issue.status === "closed"
  );

  // Mocked neighboring/community verifications this user validated
  const verifiedReports = response?.data?.slice(0, 2).map((issue: any) => ({
    ...issue,
    verifiedAt: new Date(Date.now() - 3600000 * 24 * 2),
  })) || [];

  const reportedCount = userIssues.length;
  const resolvedCount = completedReports.length;
  const verificationCount = verifiedReports.length;

  // Gamified contribution score
  const contributionScore = reportedCount * 15 + resolvedCount * 30 + verificationCount * 10;

  return (
    <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-slate-50/40 pb-12">
      {/* Profile Header Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-100" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 font-extrabold text-xl border border-slate-100">
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-h2 font-extrabold text-gray-900">{user.name}</h1>
                  <Badge variant="primary" className="text-[10px] py-0.5 uppercase font-bold tracking-wider">
                    {user.role}
                  </Badge>
                </div>
                <p className="text-small text-gray-400 flex items-center gap-1 mt-1 font-semibold">
                  <Calendar size={13} />
                  Active Civic Reporter
                </p>
              </div>
            </div>

            {/* Gamified Contribution Score Card */}
            <Card padding="sm" className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-none shadow-md shrink-0 flex items-center gap-4 px-5">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-100 block">Contribution Score</span>
                <span className="text-h1 font-extrabold">{contributionScore} PTS</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <TrendingUp size={20} />
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Main activity list tabs */}
          <div className="md:col-span-2 space-y-4">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white p-1 rounded-xl shadow-sm">
              <button
                onClick={() => setActiveTab("active")}
                className={cn(
                  "flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-colors cursor-pointer",
                  activeTab === "active" ? "bg-slate-100 text-slate-900" : "text-gray-500 hover:text-slate-800"
                )}
              >
                Active Reports ({activeReports.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={cn(
                  "flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-colors cursor-pointer",
                  activeTab === "completed" ? "bg-slate-100 text-slate-900" : "text-gray-500 hover:text-slate-800"
                )}
              >
                Completed ({completedReports.length})
              </button>
              <button
                onClick={() => setActiveTab("verifications")}
                className={cn(
                  "flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-colors cursor-pointer",
                  activeTab === "verifications" ? "bg-slate-100 text-slate-900" : "text-gray-500 hover:text-slate-800"
                )}
              >
                Verifications ({verifiedReports.length})
              </button>
            </div>

            {/* Tab content list */}
            <div className="space-y-3">
              {activeTab === "active" && (
                activeReports.length > 0 ? (
                  activeReports.map((issue: any) => (
                    <Link key={issue.id} href={`/issues/${issue.id}`}>
                      <Card hover padding="md" className="border-slate-100 bg-white text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] uppercase font-extrabold text-blue-600 block mb-0.5">
                              {issue.category}
                            </span>
                            <h3 className="text-small font-bold text-gray-900 truncate">
                              {issue.title}
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-1 font-semibold truncate">
                              📍 {issue.location.address}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="warning" className="uppercase text-[9px] font-bold">
                              {issue.status.replace("_", " ")}
                            </Badge>
                            <ChevronRight size={16} className="text-gray-300" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <Card padding="lg" className="text-center bg-white border-slate-100 py-10">
                    <Clock size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-small font-bold text-slate-800">No active reports</p>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                      Issues you submit will appear here during community verification and repair stages.
                    </p>
                  </Card>
                )
              )}

              {activeTab === "completed" && (
                completedReports.length > 0 ? (
                  completedReports.map((issue: any) => (
                    <Link key={issue.id} href={`/issues/${issue.id}`}>
                      <Card hover padding="md" className="border-slate-100 bg-white text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] uppercase font-extrabold text-green-600 block mb-0.5">
                              {issue.category}
                            </span>
                            <h3 className="text-small font-bold text-gray-900 truncate">
                              {issue.title}
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-1 font-semibold truncate">
                              📍 {issue.location.address}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="success" className="uppercase text-[9px] font-bold">
                              Resolved
                            </Badge>
                            <ChevronRight size={16} className="text-gray-300" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <Card padding="lg" className="text-center bg-white border-slate-100 py-10">
                    <CheckCircle size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-small font-bold text-slate-800">No completed reports</p>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                      Once issues you submit are successfully resolved, they will be archived here.
                    </p>
                  </Card>
                )
              )}

              {activeTab === "verifications" && (
                verifiedReports.length > 0 ? (
                  verifiedReports.map((issue: any) => (
                    <Link key={issue.id} href={`/issues/${issue.id}`}>
                      <Card hover padding="md" className="border-slate-100 bg-white text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] uppercase font-extrabold text-indigo-600 block mb-0.5">
                              Neighbor verification
                            </span>
                            <h3 className="text-small font-bold text-gray-900 truncate">
                              Confirmed {issue.title}
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-1 font-semibold truncate">
                              Verified on {issue.verifiedAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <ThumbsUp size={16} className="text-indigo-600" />
                            <ChevronRight size={16} className="text-gray-300" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <Card padding="lg" className="text-center bg-white border-slate-100 py-10">
                    <ThumbsUp size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-small font-bold text-slate-800">No confirmations yet</p>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                      Verify nearby issues on the map to help speed up local resolution times.
                    </p>
                  </Card>
                )
              )}
            </div>

          </div>

          {/* Sidebar Achievements & Activity */}
          <div className="space-y-6">
            
            {/* Achievements Card */}
            <Card padding="md" className="shadow-sm border-slate-100 bg-white text-left">
              <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                <Award size={14} className="text-yellow-500" />
                Citizen Achievements
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    📢
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 block">First Reporter</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Reported first neighborhood issue</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    🤝
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 block">Verified Neighbor</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Confirmed 2+ issues near home</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 opacity-50">
                  <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
                    🎖️
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 block">Civic Sentinel (Locked)</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Gain 100 contribution points</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Activity timeline */}
            <Card padding="md" className="shadow-sm border-slate-100 bg-white text-left">
              <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                <Activity size={14} />
                Recent History
              </h3>
              <div className="space-y-3.5 border-l border-slate-100 pl-4 ml-2">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white" />
                  <p className="text-[11px] font-bold text-slate-800">Submitted issue: Pothole on Main St</p>
                  <span className="text-[9px] text-slate-400 block mt-0.5">2 hours ago</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white" />
                  <p className="text-[11px] font-bold text-slate-800">Verified issue: Broken streetlamp</p>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Yesterday</span>
                </div>
              </div>
            </Card>

            {/* Logout button */}
            <Button variant="ghost" className="w-full text-slate-400 hover:text-red-600" onClick={() => logout()}>
              <LogOut size={16} />
              Sign Out
            </Button>

          </div>

        </div>
      </div>
    </div>
  );
}
