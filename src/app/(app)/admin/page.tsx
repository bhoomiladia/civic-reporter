"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { dashboardApi } from "@/services/dashboard.api";
import { issuesApi } from "@/services/issues.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, STATUS_CONFIG } from "@/lib/constants";
import { useUpdateIssue } from "@/hooks/use-issues";
import {
  BarChart3,
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Shield,
  Loader2,
  FileText,
  UserCheck,
  Check,
  X,
  RefreshCw,
  SlidersHorizontal,
  Wrench,
  Truck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";

// Tabs corresponding to lifecycle stages
const ADMIN_TABS = [
  { id: "all", label: "All Reports" },
  { id: "verification", label: "Needs Verification" },
  { id: "review", label: "Municipality Review" },
  { id: "assigned", label: "Worker Assigned" },
  { id: "dispatched", label: "Crew Dispatched" },
  { id: "repair", label: "In Progress" },
  { id: "resolved", label: "Resolved" },
];

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setStatsLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getDashboardData("admin");
      setDashboardData(data);

      const issuesResponse = await issuesApi.getIssues({ limit: 40 });
      setRecentIssues(issuesResponse?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch admin stats:", err);
      setError(err?.response?.data?.message || "Unauthorized access. Admin role required.");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchDashboardData();
    }
  }, [user]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-small text-gray-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  // Not Logged In or Not Admin State
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-lg p-6 bg-white border border-gray-150">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-4 border border-red-100">
            <Shield size={24} />
          </div>
          <h1 className="text-h2 text-gray-900 mb-2">Access Denied</h1>
          <p className="text-body text-gray-500 mb-6">
            You need to be logged in as an <strong>Admin / Gov</strong> to view the management dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/profile">
              <Button className="w-full font-semibold">
                Go to Profile to Sign In
              </Button>
            </Link>
            <Link href="/map">
              <Button variant="outline" className="w-full">
                View Public Map
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (statsLoading && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-small text-gray-500">Loading admin control panel...</p>
        </div>
      </div>
    );
  }

  const { issueStats, topContributors } = dashboardData || {
    issueStats: { total: 0, byStatus: {}, byCategory: {}, byPriority: {} },
    topContributors: [],
  };

  const totalReported = issueStats.total || 0;
  const totalResolved = issueStats.byStatus?.resolved || 0;
  const totalVerification = issueStats.byStatus?.verification || 0;
  const totalReview = issueStats.byStatus?.review || 0;
  const totalAssigned = issueStats.byStatus?.assigned || 0;
  const totalDispatched = issueStats.byStatus?.dispatched || 0;
  const totalRepair = issueStats.byStatus?.repair || 0;
  
  const resolutionRate = totalReported > 0 ? Math.round((totalResolved / totalReported) * 100) : 0;

  // Filter issues based on active tab
  const filteredIssues = recentIssues.filter((issue) => {
    if (activeTab === "all") return true;
    return issue.status === activeTab;
  });

  // Action dispatcher handler
  const handleTransitionStatus = async (issueId: string, nextStatus: string) => {
    setUpdatingId(issueId);
    try {
      await issuesApi.updateIssue(issueId, { status: nextStatus });
      // Update local state for immediate response
      setRecentIssues((prev) =>
        prev.map((issue) => (issue.id === issueId ? { ...issue, status: nextStatus } : issue))
      );
    } catch (err) {
      console.error("Failed to advance status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-slate-50/40 py-8 px-4 sm:px-6 max-w-7xl mx-auto text-left">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-h1 font-extrabold text-gray-900 flex items-center gap-2">
            <Shield className="text-blue-600" size={28} />
            Lifecycle Admin Command Center
          </h1>
          <p className="text-body text-gray-500 mt-1">
            Track, verify, and dispatch work orders through the civic lifecycle stages.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 bg-white border border-gray-200 font-bold"
          >
            <RefreshCw size={14} className={cn(statsLoading && "animate-spin")} />
            Sync Lifecycle
          </Button>
        </div>
      </div>

      {/* Grid of Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-slate-100">
          <div>
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
              Total Reports
            </span>
            <h3 className="text-h1 text-gray-900 font-black mt-1">
              {totalReported}
            </h3>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
            <FileText size={12} className="text-blue-500" />
            Lifetime reported issues
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-slate-100">
          <div>
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
              Verification Pending
            </span>
            <h3 className="text-h1 text-indigo-600 font-black mt-1">
              {totalVerification}
            </h3>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
            <Clock size={12} className="text-indigo-500" />
            Waiting for neighbors
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-slate-100">
          <div>
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
              Resolved & Fixed
            </span>
            <h3 className="text-h1 text-green-600 font-black mt-1">
              {totalResolved}
            </h3>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-green-500" />
            Completed resolutions
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-slate-100">
          <div>
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
              Resolution Rate
            </span>
            <h3 className="text-h1 text-blue-600 font-black mt-1">
              {resolutionRate}%
            </h3>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
            <TrendingUp size={12} className="text-blue-500" />
            Overall resolution efficiency
          </div>
        </Card>
      </div>

      {/* Middle Grid: Categories & Top Contributors */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 p-6 bg-white border border-slate-100">
          <h2 className="text-h3 text-gray-900 mb-4 flex items-center gap-2 font-extrabold">
            <BarChart3 size={18} className="text-blue-600" />
            Reports By Category
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => {
              const count = issueStats.byCategory?.[cat.id] || 0;
              const pct = totalReported > 0 ? Math.round((count / totalReported) * 100) : 0;
              return (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-small font-bold text-gray-700 truncate">
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-small font-bold text-gray-900">{count}</span>
                    <span className="text-[11px] text-gray-400 font-bold w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 bg-white border border-slate-100">
          <h2 className="text-h3 text-gray-900 mb-4 flex items-center gap-2 font-extrabold">
            <UserCheck size={18} className="text-blue-600" />
            Top Contributors
          </h2>
          <div className="space-y-4">
            {topContributors.length > 0 ? (
              topContributors.map((contrib: any) => (
                <div key={contrib.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {contrib.avatar ? (
                      <img src={contrib.avatar} alt={contrib.name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-small font-bold">
                        {contrib.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-small font-bold text-gray-900">{contrib.name}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{contrib.role}</div>
                    </div>
                  </div>
                  <Badge variant="primary" className="text-small font-bold px-2 py-0.5">
                    {contrib.issuesReported || 0} Reports
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400 text-small">No contributor records yet.</div>
            )}
          </div>
        </Card>
      </div>

      {/* Lifecycle Tabs Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer",
              activeTab === tab.id
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Raw incoming issue ledger */}
      <Card className="p-6 bg-white border border-slate-100 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h3 text-gray-900 flex items-center gap-2 font-extrabold">
            <FileText size={18} className="text-slate-400" />
            Operational Queue ({filteredIssues.length})
          </h2>
          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wider">
            Live Queue
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">ID & Title</th>
                <th className="pb-3 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Reporter & Location</th>
                <th className="pb-3 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Stage</th>
                <th className="pb-3 text-[11px] font-extrabold uppercase tracking-wider text-gray-400 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 pr-3">
                      <Link href={`/issues/${issue.id}`} className="hover:underline">
                        <div className="text-small font-bold text-gray-900 truncate max-w-[200px]" title={issue.title}>
                          {issue.title}
                        </div>
                      </Link>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{issue.id}</div>
                    </td>
                    <td className="py-4 pr-3">
                      <div className="text-small font-semibold text-gray-700">
                        {issue.reportedByName || (typeof issue.reportedBy === "object" && issue.reportedBy?.name) || "Anonymous"}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-[220px]" title={issue.location?.address}>
                        {issue.location?.address}
                      </div>
                    </td>
                    <td className="py-4 pr-3">
                      <Badge
                        variant={
                          issue.status === "resolved"
                            ? "success"
                            : issue.status === "closed"
                            ? "default"
                            : issue.status === "verification" || issue.status === "review"
                            ? "warning"
                            : "primary"
                        }
                        dot
                      >
                        {STATUS_CONFIG[issue.status]?.label || issue.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        
                        {/* 9-stage operational controller actions */}
                        {issue.status === "reported" && (
                          <Button
                            size="sm"
                            onClick={() => handleTransitionStatus(issue.id, "verification")}
                            disabled={updatingId === issue.id}
                            className="bg-indigo-600 hover:bg-indigo-700 font-bold"
                          >
                            Push to Verification
                          </Button>
                        )}

                        {issue.status === "verification" && (
                          <Button
                            size="sm"
                            onClick={() => handleTransitionStatus(issue.id, "verified")}
                            disabled={updatingId === issue.id}
                            className="bg-cyan-600 hover:bg-cyan-700 font-bold"
                          >
                            Verify Manually
                          </Button>
                        )}

                        {issue.status === "verified" && (
                          <Button
                            size="sm"
                            onClick={() => handleTransitionStatus(issue.id, "review")}
                            disabled={updatingId === issue.id}
                            className="bg-purple-600 hover:bg-purple-700 font-bold"
                          >
                            Review File
                          </Button>
                        )}

                        {issue.status === "review" && (
                          <Button
                            size="sm"
                            onClick={() => handleTransitionStatus(issue.id, "assigned")}
                            disabled={updatingId === issue.id}
                            className="bg-amber-600 hover:bg-amber-700 font-bold"
                          >
                            Assign Crew
                          </Button>
                        )}

                        {issue.status === "assigned" && (
                          <Button
                            size="sm"
                            onClick={() => handleTransitionStatus(issue.id, "dispatched")}
                            disabled={updatingId === issue.id}
                            className="bg-red-600 hover:bg-red-700 font-bold"
                          >
                            Dispatch Crew
                          </Button>
                        )}

                        {issue.status === "dispatched" && (
                          <Button
                            size="sm"
                            onClick={() => handleTransitionStatus(issue.id, "repair")}
                            disabled={updatingId === issue.id}
                            className="bg-orange-600 hover:bg-orange-700 font-bold"
                          >
                            Start Repair
                          </Button>
                        )}

                        {issue.status === "repair" && (
                          <Button
                            size="sm"
                            onClick={() => handleTransitionStatus(issue.id, "resolved")}
                            disabled={updatingId === issue.id}
                            className="bg-green-600 hover:bg-green-700 font-bold"
                          >
                            Resolve Issue
                          </Button>
                        )}

                        {issue.status === "resolved" && (
                          <Button
                            size="sm"
                            onClick={() => handleTransitionStatus(issue.id, "closed")}
                            disabled={updatingId === issue.id}
                            className="bg-slate-600 hover:bg-slate-700 font-bold"
                          >
                            Close File
                          </Button>
                        )}

                        <Link href={`/issues/${issue.id}`}>
                          <Button size="sm" variant="outline" className="border-slate-200">
                            Track
                            <ArrowUpRight size={11} className="ml-0.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 text-small">
                    No reports in this stage.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
