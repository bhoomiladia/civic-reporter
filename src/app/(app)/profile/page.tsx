"use client";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockUsers, mockIssues } from "@/lib/mock-data";
import {
  User,
  MapPin,
  Calendar,
  Settings,
  Bell,
  ChevronRight,
  LogOut,
  Shield,
  Award,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const user = mockUsers[0]; // Mock current user
  const userIssues = mockIssues.filter(
    (issue) => issue.reportedBy.id === user.id
  );

  return (
    <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xl">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-h2 text-gray-900">{user.name}</h1>
              <p className="text-small text-gray-500 flex items-center gap-1">
                <Calendar size={14} />
                Joined {formatDate(user.joinedAt)}
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
              {user.issuesReported}
            </div>
            <div className="text-small text-gray-500">Reported</div>
          </Card>
          <Card padding="md" className="text-center">
            <div className="text-h2 text-gray-900 mb-0.5">
              {user.issuesResolved}
            </div>
            <div className="text-small text-gray-500">Resolved</div>
          </Card>
          <Card padding="md" className="text-center">
            <div className="text-h2 text-gray-900 mb-0.5">
              {Math.round((user.issuesResolved / user.issuesReported) * 100)}%
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
            userIssues.map((issue) => (
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
              { icon: Bell, label: "Notifications", desc: "Manage alerts" },
              { icon: Shield, label: "Privacy", desc: "Data and visibility" },
              { icon: Award, label: "Achievements", desc: "Your badges" },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
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
        <Button variant="ghost" className="w-full mt-6 text-gray-400 hover:text-red-600">
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
