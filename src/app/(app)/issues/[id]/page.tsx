"use client";

import { use, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDate, formatTimeAgo } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon, StatusBadge } from "@/components/shared/status-badge";
import { useIssue, useVoteIssue, useAddComment, useVerifyIssue } from "@/hooks/use-issues";
import {
  ArrowLeft,
  ArrowUp,
  MessageCircle,
  MapPin,
  Clock,
  User,
  Share2,
  Flag,
  CheckCircle2,
  Circle,
  AlertCircle,
  Pencil,
  Loader2,
} from "lucide-react";

const timelineIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  created: Circle,
  acknowledged: AlertCircle,
  assigned: User,
  updated: Pencil,
  resolved: CheckCircle2,
};

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: issue, isLoading, error } = useIssue(id);
  const voteMutation = useVoteIssue(id);
  const commentMutation = useAddComment(id);
  const verifyMutation = useVerifyIssue(id);

  const [commentText, setCommentText] = useState("");

  const handleVote = () => {
    voteMutation.mutate('up');
  };

  const handleVerify = () => {
    verifyMutation.mutate();
  };

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText, {
      onSuccess: () => {
        setCommentText("");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-secondary">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-body text-gray-500">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-h1 text-gray-900 mb-2">Issue not found</h1>
          <p className="text-body text-gray-500 mb-6">
            The issue you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/issues">
            <Button variant="outline">
              <ArrowLeft size={16} />
              Back to Issues
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const commentsList = issue.comments || [];
  const timelineList = issue.timeline || [];

  return (
    <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-surface-secondary">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link
            href="/issues"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-small font-medium">Issues</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Issue header */}
            <Card padding="lg">
              <div className="flex items-start gap-3 mb-4">
                <CategoryIcon category={issue.category} size={20} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h1 className="text-h2 text-gray-900">{issue.title}</h1>
                    <StatusBadge status={issue.status} />
                  </div>
                  <div className="flex items-center gap-3 text-small text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {issue.location.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatTimeAgo(issue.reportedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-body text-gray-600 leading-relaxed mb-4">
                {issue.description}
              </p>

              {/* Photos rendering */}
              {issue.photos && issue.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {issue.photos.map((photoUrl: string, idx: number) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={photoUrl} alt={`Issue attachment ${idx + 1}`} className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                <Button variant="outline" size="sm" onClick={handleVote} disabled={voteMutation.isPending}>
                  <ArrowUp size={14} className={cn(voteMutation.isPending && "animate-pulse")} />
                  Upvote · {issue.upvotes}
                </Button>
                <Button variant="outline" size="sm" onClick={handleVerify} disabled={verifyMutation.isPending}>
                  <CheckCircle2 size={14} />
                  Verify ({(issue as any).verificationsCount || 0})
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 size={14} />
                  Share
                </Button>
                <Button variant="ghost" size="sm" className="ml-auto text-gray-400">
                  <Flag size={14} />
                </Button>
              </div>
            </Card>

            {/* Timeline */}
            <Card padding="lg">
              <h2 className="text-h3 text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-0">
                {timelineList.length === 0 ? (
                  <p className="text-small text-gray-400">No events recorded yet.</p>
                ) : (
                  timelineList.map((event: any, i: number) => {
                    const Icon = timelineIcons[event.type] || Circle;
                    const isLast = i === timelineList.length - 1;
                    const colorMap: Record<string, string> = {
                      created: "text-blue-600 bg-blue-50",
                      acknowledged: "text-purple-600 bg-purple-50",
                      assigned: "text-amber-600 bg-amber-50",
                      updated: "text-gray-600 bg-gray-100",
                      resolved: "text-green-600 bg-green-50",
                    };
                    return (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                              colorMap[event.type] || "text-gray-400 bg-gray-100"
                            )}
                          >
                            <Icon size={14} />
                          </div>
                          {!isLast && (
                            <div className="w-px h-full bg-gray-200 my-1 min-h-[24px]" />
                          )}
                        </div>
                        <div className={cn("pb-4", isLast && "pb-0")}>
                          <p className="text-small font-medium text-gray-900">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[12px] text-gray-400">
                              {formatDate(event.createdAt)}
                            </span>
                            {event.actor && (
                              <span className="text-[12px] text-gray-400">
                                · {event.actor}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Comments */}
            <Card padding="lg">
              <h2 className="text-h3 text-gray-900 mb-4">
                Comments ({commentsList.length})
              </h2>
              {commentsList.length === 0 ? (
                <p className="text-small text-gray-400 text-center py-6">
                  No comments yet. Be the first to comment.
                </p>
              ) : (
                <div className="space-y-4">
                  {commentsList.map((comment: any) => (
                    <div
                      key={comment.id}
                      className={cn(
                        "flex gap-3",
                        comment.isOfficial && "bg-blue-50/50 -mx-2 px-2 py-2 rounded-lg"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold",
                          comment.isOfficial
                            ? "bg-blue-700 text-white"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {comment.userName ? comment.userName.charAt(0) : "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-small font-medium text-gray-900">
                            {comment.userName || "User"}
                          </span>
                          {comment.isOfficial && (
                            <Badge variant="primary" className="text-[9px] py-0">
                              Official
                            </Badge>
                          )}
                          <span className="text-[12px] text-gray-400">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-small text-gray-600">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment input */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePostComment();
                  }}
                  className="flex-1 h-9 px-3 rounded-lg bg-gray-50 border border-gray-200 text-small text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                />
                <Button size="sm" onClick={handlePostComment} disabled={commentMutation.isPending}>
                  {commentMutation.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status info */}
            <Card padding="md">
              <h3 className="text-tiny text-gray-400 mb-3">Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-small text-gray-500">Status</span>
                  <StatusBadge status={issue.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-small text-gray-500">Priority</span>
                  <Badge
                    variant={
                      issue.priority === "critical"
                        ? "danger"
                        : issue.priority === "high"
                        ? "warning"
                        : "default"
                    }
                    dot
                  >
                    {issue.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-small text-gray-500">ID</span>
                  <span className="text-small font-mono text-gray-600 truncate max-w-[120px]">
                    {issue.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-small text-gray-500">Reported</span>
                  <span className="text-small text-gray-600">
                    {formatDate(issue.reportedAt)}
                  </span>
                </div>
                {issue.assignedTo && (
                  <div className="flex items-center justify-between">
                    <span className="text-small text-gray-500">Assigned</span>
                    <span className="text-small text-gray-600 text-right max-w-[140px] truncate">
                      {issue.assignedTo}
                    </span>
                  </div>
                )}
                {issue.estimatedResolution && (
                  <div className="flex items-center justify-between">
                    <span className="text-small text-gray-500">Est. Fix</span>
                    <span className="text-small text-gray-600">
                      {formatDate(issue.estimatedResolution)}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Reporter */}
            {issue.reportedBy && (
              <Card padding="md">
                <h3 className="text-tiny text-gray-400 mb-3">Reported By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-small">
                    {issue.reportedBy.name ? issue.reportedBy.name.charAt(0) : "U"}
                  </div>
                  <div>
                    <div className="text-small font-medium text-gray-900">
                      {issue.reportedBy.name}
                    </div>
                    <div className="text-[12px] text-gray-400">
                      {issue.reportedBy.issuesReported || 0} reports
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Location */}
            <Card padding="none" className="overflow-hidden">
              <div className="h-[160px] bg-[#f2efe9] relative">
                <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                  <defs>
                    <pattern id="detail-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e8e4dd" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#detail-grid)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg border-2 border-white">
                    <MapPin size={16} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="text-small font-medium text-gray-900">
                  {issue.location.address}
                </div>
                {issue.location.neighborhood && (
                  <div className="text-[12px] text-gray-400 mt-0.5">
                    {issue.location.neighborhood}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
