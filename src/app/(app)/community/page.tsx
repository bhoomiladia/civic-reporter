"use client";

import { cn } from "@/lib/utils";
import { formatTimeAgo, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryIcon, StatusBadge } from "@/components/shared/status-badge";
import { useCommunityOverview, usePublicStats } from "@/hooks/use-community";
import { useIssues } from "@/hooks/use-issues";
import Link from "next/link";
import {
  Trophy,
  CheckCircle2,
  Star,
  Users,
  BarChart3,
  Target,
  TrendingUp,
  Loader2,
} from "lucide-react";

export default function CommunityPage() {
  const { data: overview, isLoading: overviewLoading } = useCommunityOverview();
  const { data: publicStats, isLoading: statsLoading } = usePublicStats();
  const { data: recentIssuesResp, isLoading: issuesLoading } = useIssues({ limit: 10 });

  const recentResolved = overview?.recentlyResolved || [];
  const topContributors = overview?.topContributors || [];
  const recentIssues = recentIssuesResp?.data || [];

  const stats = publicStats || {
    activeReporters: 0,
    issuesResolvedThisMonth: 0,
    resolutionRate: 0,
    averageResponseTime: "N/A",
  };

  const isLoading = overviewLoading || statsLoading || issuesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-secondary">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-body text-gray-500">Loading community insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-h1 text-gray-900 mb-1">Community</h1>
          <p className="text-body text-gray-500">
            Together, we&apos;re making our neighborhoods better.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Community Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Card padding="md" className="text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mx-auto mb-3">
              <Users size={20} />
            </div>
            <div className="text-h2 text-gray-900 mb-0.5">
              {stats.activeReporters || stats.totalCitizens || 0}
            </div>
            <div className="text-small text-gray-500">Active Citizens</div>
          </Card>
          <Card padding="md" className="text-center">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-3">
              <CheckCircle2 size={20} />
            </div>
            <div className="text-h2 text-gray-900 mb-0.5">
              {stats.issuesResolved || stats.resolvedCount || 0}
            </div>
            <div className="text-small text-gray-500">Total Resolved</div>
          </Card>
          <Card padding="md" className="text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mx-auto mb-3">
              <Target size={20} />
            </div>
            <div className="text-h2 text-gray-900 mb-0.5">
              {stats.resolutionRate || 0}%
            </div>
            <div className="text-small text-gray-500">Resolution Rate</div>
          </Card>
          <Card padding="md" className="text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mx-auto mb-3">
              <TrendingUp size={20} />
            </div>
            <div className="text-h2 text-gray-900 mb-0.5 truncate max-w-[120px] mx-auto">
              {stats.avgResponseTime || '2 days'}
            </div>
            <div className="text-small text-gray-500">Avg. Response Time</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <h2 className="text-h3 text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-gray-400" />
              Recent Activity
            </h2>
            <Card padding="none">
              <div className="divide-y divide-gray-100">
                {recentIssues.length === 0 ? (
                  <p className="text-small text-gray-400 p-4 text-center">No recent activity.</p>
                ) : (
                  recentIssues.map((issue: any) => (
                    <div
                      key={issue.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <CategoryIcon
                        category={issue.category}
                        size={14}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-small text-gray-900">
                          <span className="font-medium">
                            New issue reported: {issue.title}
                          </span>
                        </p>
                        <p className="text-[12px] text-gray-400 mt-0.5 truncate">
                          {issue.location.address}
                        </p>
                      </div>
                      <span className="text-[12px] text-gray-400 shrink-0">
                        {formatTimeAgo(issue.reportedAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <div>
              <h2 className="text-h3 text-gray-900 mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                Top Contributors
              </h2>
              <Card padding="none">
                <div className="divide-y divide-gray-100">
                  {topContributors.length === 0 ? (
                    <p className="text-small text-gray-400 p-4 text-center">No top contributors listed.</p>
                  ) : (
                    topContributors.map((user: any, i: number) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <span
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                            i === 0
                              ? "bg-amber-100 text-amber-700"
                              : i === 1
                              ? "bg-gray-100 text-gray-600"
                              : i === 2
                              ? "bg-orange-50 text-orange-600"
                              : "bg-gray-50 text-gray-400"
                          )}
                        >
                          {i + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-[12px] shrink-0">
                          {user.name ? user.name.charAt(0) : "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-small font-medium text-gray-900 truncate">
                            {user.name || "User"}
                          </div>
                          <div className="text-[12px] text-gray-400">
                            {user.issuesReported || 0} reports
                          </div>
                        </div>
                        {i === 0 && (
                          <Star
                            size={14}
                            className="text-amber-400 fill-amber-400"
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Recent Resolutions */}
            <div>
              <h2 className="text-h3 text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                Recently Resolved
              </h2>
              <div className="space-y-2">
                {recentResolved.length === 0 ? (
                  <p className="text-small text-gray-400 text-center py-4 bg-white border border-gray-200 rounded-xl">No resolved issues yet.</p>
                ) : (
                  recentResolved.map((issue: any) => (
                    <Link href={`/issues/${issue.id}`} key={issue.id}>
                      <Card hover padding="sm" className="mb-2 block cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <CategoryIcon category={issue.category} size={14} />
                          <div className="flex-1 min-w-0">
                            <div className="text-small font-medium text-gray-900 truncate">
                              {issue.title}
                            </div>
                            <div className="text-[12px] text-gray-400">
                              {issue.location.neighborhood || issue.location.address}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
