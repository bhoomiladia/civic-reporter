"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils";
import { CategoryIcon, StatusBadge } from "@/components/shared/status-badge";
import { ArrowUp, MessageCircle, MapPin } from "lucide-react";
import type { Issue } from "@/lib/types";

interface IssueCardProps {
  issue: Issue;
  compact?: boolean;
  className?: string;
}

export function IssueCard({ issue, compact = false, className }: IssueCardProps) {
  return (
    <Link
      href={`/issues/${issue.id}`}
      className={cn(
        "block bg-white rounded-xl border border-gray-200",
        "transition-all duration-normal ease-out",
        "hover:shadow-md hover:border-gray-300",
        "active:scale-[0.99]",
        "group",
        compact ? "p-3" : "p-4",
        className
      )}
    >
      <div className="flex gap-3">
        <CategoryIcon category={issue.category} size={compact ? 16 : 18} />

        <div className="flex-1 min-w-0">
          {/* Title and status */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              className={cn(
                "font-medium text-gray-900 truncate",
                "group-hover:text-blue-700 transition-colors",
                compact ? "text-small" : "text-body"
              )}
            >
              {issue.title}
            </h3>
            <StatusBadge status={issue.status} />
          </div>

          {/* Description preview */}
          {!compact && (
            <p className="text-small text-gray-500 line-clamp-2 mb-2.5">
              {issue.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 text-gray-400">
            <span className="inline-flex items-center gap-1 text-[12px]">
              <MapPin size={12} />
              <span className="truncate max-w-[120px]">
                {issue.location.neighborhood || issue.location.address}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 text-[12px]">
              <ArrowUp size={12} />
              {issue.upvotes}
            </span>
            {(issue.comments?.length || 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-[12px]">
                <MessageCircle size={12} />
                {issue.comments?.length || 0}
              </span>
            )}
            <span className="text-[12px] ml-auto">
              {formatTimeAgo(issue.reportedAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
