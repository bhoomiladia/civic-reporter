"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { dashboardApi } from "@/services/dashboard.api";
import { issuesApi } from "@/services/issues.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, STATUS_CONFIG } from "@/lib/constants";
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
} from "lucide-react";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setStatsLoading(true);
    setError(null);
    try {
      // 1. Fetch dashboard data (only works if admin)
      const data = await dashboardApi.getDashboardData("admin");
      setDashboardData(data);

      // 2. Fetch all recent issues to display in detail table
      const issuesResponse = await issuesApi.getIssues({ limit: 15 });
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

  const { issueStats, topContributors, recentlyResolved } = dashboardData || {
    issueStats: { total: 0, byStatus: {}, byCategory: {}, byPriority: {} },
    topContributors: [],
    recentlyResolved: [],
  };

  const totalReported = issueStats.total || 0;
  const totalResolved = issueStats.byStatus?.resolved || 0;
  const totalInProgress = issueStats.byStatus?.in_progress || 0;
  const totalAcknowledged = issueStats.byStatus?.acknowledged || 0;
  const totalPending = issueStats.byStatus?.reported || 0;
  
  const resolutionRate = totalReported > 0 ? Math.round((totalResolved / totalReported) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-slate-50/50 py-6 sm:py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-h1 text-gray-900 flex items-center gap-2">
            <Shield className="text-blue-600" size={28} />
            Command Center
          </h1>
          <p className="text-body text-gray-500 mt-1">
            Realtime operational insight, user statistics, and issues routing.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 bg-white border border-gray-200"
          >
            <RefreshCw size={14} className={cn(statsLoading && "animate-spin")} />
            Sync Realtime
          </Button>
        </div>
      </div>

      {/* Grid of Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-gray-150">
          <div>
            <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">
              Total Reports
            </span>
            <h3 className="text-h1 text-gray-900 font-bold mt-1">
              {totalReported}
            </h3>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
            <FileText size={12} className="text-blue-500" />
            Lifetime reported issues
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-gray-150">
          <div>
            <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">
              Active Issues
            </span>
            <h3 className="text-h1 text-orange-600 font-bold mt-1">
              {totalPending + totalInProgress + totalAcknowledged}
            </h3>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
            <Clock size={12} className="text-orange-500" />
            {totalPending} pending, {totalInProgress} in progress
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-gray-150">
          <div>
            <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">
              Resolved
            </span>
            <h3 className="text-h1 text-green-600 font-bold mt-1">
              {totalResolved}
            </h3>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-green-500" />
            Issues successfully closed
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-white border border-gray-150">
          <div>
            <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">
              Resolution Rate
            </span>
            <h3 className="text-h1 text-blue-600 font-bold mt-1">
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
        {/* Left Column: Categories stats */}
        <Card className="lg:col-span-2 p-6 bg-white border border-gray-150">
          <h2 className="text-h3 text-gray-900 mb-4 flex items-center gap-2 font-bold">
            <BarChart3 size={18} className="text-blue-600" />
            Reports By Category
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => {
              const count = issueStats.byCategory?.[cat.id] || 0;
              const pct = totalReported > 0 ? Math.round((count / totalReported) * 100) : 0;
              return (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-small font-medium text-gray-800 truncate">
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-small font-bold text-gray-900">{count}</span>
                    <span className="text-[11px] text-gray-400 font-medium w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Top Contributors */}
        <Card className="p-6 bg-white border border-gray-150">
          <h2 className="text-h3 text-gray-900 mb-4 flex items-center gap-2 font-bold">
            <UserCheck size={18} className="text-blue-600" />
            Top Contributors
          </h2>
          <div className="space-y-4">
            {topContributors.length > 0 ? (
              topContributors.map((contrib: any, idx: number) => (
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
                      <div className="text-small font-medium text-gray-900">{contrib.name}</div>
                      <div className="text-[11px] text-gray-400 uppercase tracking-wider">{contrib.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="primary" className="text-small font-semibold px-2 py-0.5">
                      {contrib.issuesReported || 0} Reports
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400 text-small">No contributor records yet.</div>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Section: Raw incoming issue ledger */}
      <Card className="p-6 bg-white border border-gray-150 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h3 text-gray-900 flex items-center gap-2 font-bold">
            <FileText size={18} className="text-blue-600" />
            Incoming Reports Ledger
          </h2>
          <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-0.5 font-semibold">
            Realtime
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">ID & Title</th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Reporter</th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Category</th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Reported Date</th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentIssues.length > 0 ? (
                recentIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 pr-3">
                      <div className="text-small font-medium text-gray-900 truncate max-w-[200px]" title={issue.title}>
                        {issue.title}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">{issue.id}</div>
                    </td>
                    <td className="py-4 pr-3">
                      <div className="text-small font-medium text-gray-700">
                        {issue.reportedByName || (typeof issue.reportedBy === 'object' && issue.reportedBy?.name) || "Anonymous"}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-[150px]" title={issue.location?.address}>
                        {issue.location?.address}
                      </div>
                    </td>
                    <td className="py-4 pr-3">
                      <span className="text-[12px] font-medium text-gray-600 capitalize">
                        {issue.category.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 pr-3">
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
                    </td>
                    <td className="py-4 pr-3 text-[12px] text-gray-500">
                      {formatDate(issue.createdAt)}
                    </td>
                    <td className="py-4 text-right">
                      <Link href={`/issues/${issue.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-gray-200">
                          Route
                          <ArrowUpRight size={12} className="ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 text-small">
                    No reports filed yet.
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
