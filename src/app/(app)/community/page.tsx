"use client";

import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryIcon, StatusBadge } from "@/components/shared/status-badge";
import { mockIssues, mockUsers, mockStats } from "@/lib/mock-data";
import {
  Trophy,
  TrendingUp,
  CheckCircle2,
  ArrowUp,
  MessageCircle,
  Star,
  Users,
  BarChart3,
  Target,
} from "lucide-react";

export default function CommunityPage() {
  /* Recent resolutions */
  const recentResolved = mockIssues
    .filter((i) => i.status === "resolved")
    .slice(0, 3);

  /* Top contributors sorted by issues reported */
  const topContributors = [...mockUsers]
    .sort((a, b) => b.issuesReported - a.issuesReported)
    .slice(0, 5);

  /* Recent activity feed */
  const recentActivity = mockIssues
    .flatMap((issue) =>
      issue.timeline.map((event) => ({
        ...event,
        issueId: issue.id,
        issueTitle: issue.title,
        category: issue.category,
      }))
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

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
              {mockStats.activeReporters}
            </div>
            <div className="text-small text-gray-500">Active Reporters</div>
          </Card>
          <Card padding="md" className="text-center">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-3">
              <CheckCircle2 size={20} />
            </div>
            <div className="text-h2 text-gray-900 mb-0.5">
              {mockStats.issuesResolvedThisMonth}
            </div>
            <div className="text-small text-gray-500">Resolved This Month</div>
          </Card>
          <Card padding="md" className="text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mx-auto mb-3">
              <Target size={20} />
            </div>
            <div className="text-h2 text-gray-900 mb-0.5">
              {mockStats.resolutionRate}%
            </div>
            <div className="text-small text-gray-500">Resolution Rate</div>
          </Card>
          <Card padding="md" className="text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mx-auto mb-3">
              <TrendingUp size={20} />
            </div>
            <div className="text-h2 text-gray-900 mb-0.5">
              {mockStats.averageResponseTime}
            </div>
            <div className="text-small text-gray-500">Avg. Response</div>
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
                {recentActivity.map((event, i) => (
                  <div
                    key={`${event.id}-${i}`}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <CategoryIcon
                      category={event.category}
                      size={14}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-small text-gray-900">
                        <span className="font-medium">
                          {event.description}
                        </span>
                      </p>
                      <p className="text-[12px] text-gray-400 mt-0.5 truncate">
                        {event.issueTitle}
                      </p>
                    </div>
                    <span className="text-[12px] text-gray-400 shrink-0">
                      {formatTimeAgo(event.createdAt)}
                    </span>
                  </div>
                ))}
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
                  {topContributors.map((user, i) => (
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
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-small font-medium text-gray-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-[12px] text-gray-400">
                          {user.issuesReported} reports
                        </div>
                      </div>
                      {i === 0 && (
                        <Star
                          size={14}
                          className="text-amber-400 fill-amber-400"
                        />
                      )}
                    </div>
                  ))}
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
                {recentResolved.map((issue) => (
                  <Card key={issue.id} hover padding="sm">
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
