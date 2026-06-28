"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDate, formatTimeAgo } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/shared/status-badge";
import { useIssue, useVoteIssue, useAddComment, useVerifyIssue, useIssueTimeline } from "@/hooks/use-issues";
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
  Sparkles,
  Shield,
  Truck,
  Wrench,
  ThumbsUp,
  Award,
  Heart,
  ChevronRight,
  Flame,
} from "lucide-react";

// The 9 workflow stages
const STAGES = [
  { id: "reported", label: "Reported", icon: Circle, desc: "Issue submitted by resident" },
  { id: "verification", label: "Verification", icon: UsersIcon, desc: "Waiting for community consensus" },
  { id: "verified", label: "Verified", icon: Shield, desc: "Community verified" },
  { id: "review", label: "Municipality Review", icon: AlertCircle, desc: "Assessed by city administration" },
  { id: "assigned", label: "Assigned", icon: User, desc: "Work order dispatched" },
  { id: "dispatched", label: "Crew Dispatched", icon: Truck, desc: "Maintenance team on route" },
  { id: "repair", label: "Repair In Progress", icon: Wrench, desc: "Active maintenance underway" },
  { id: "resolved", label: "Resolved", icon: CheckCircle2, desc: "Fixed and inspected" },
  { id: "closed", label: "Closed", icon: CheckCircle2, desc: "Archived in community history" },
];

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: issue, isLoading, error } = useIssue(id);
  const { data: timeline } = useIssueTimeline(id);
  const voteMutation = useVoteIssue(id);
  const commentMutation = useAddComment(id);
  const verifyMutation = useVerifyIssue(id);

  const aiEvent = timeline?.find(
    (e: any) => e.actor === 'ai' || e.description?.includes('AI Image Verification')
  );

  const [commentText, setCommentText] = useState("");
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [hasVoted, setHasVoted] = useState(false);

  // Simulated live crew coordinates
  const [crewEta, setCrewEta] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const votedIssues = JSON.parse(localStorage.getItem("voted_issues") || "[]");
      setHasVoted(votedIssues.includes(id));
    }
  }, [id]);

  useEffect(() => {
    if (issue && (issue.status === "dispatched" || issue.status === "assigned")) {
      setCrewEta(Math.floor(15 + Math.random() * 25));
    }
  }, [issue]);

  const handleVote = () => {
    voteMutation.mutate("up", {
      onSuccess: () => {
        const votedIssues = JSON.parse(localStorage.getItem("voted_issues") || "[]");
        if (votedIssues.includes(id)) {
          localStorage.setItem("voted_issues", JSON.stringify(votedIssues.filter((x: string) => x !== id)));
          setHasVoted(false);
        } else {
          votedIssues.push(id);
          localStorage.setItem("voted_issues", JSON.stringify(votedIssues));
          setHasVoted(true);
        }
      }
    });
  };

  const handleVerify = () => {
    verifyMutation.mutate();
  };

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText, {
      onSuccess: () => {
        setCommentText("");
      },
    });
  };

  const handleSendFeedback = () => {
    if (satisfaction !== null) {
      setFeedbackSent(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50/50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-body text-gray-500">Loading tracking dashboard...</p>
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
              Back to Track Queue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const commentsList = issue.comments || [];
  
  // Find current stage index
  const currentStageIndex = STAGES.findIndex((s) => s.id === issue.status);
  const activeStageIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  return (
    <div className="min-h-[calc(100vh-56px)] lg:min-h-screen bg-slate-50/40 pb-12">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/issues"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-small font-semibold">Track Queue</span>
          </Link>
          <span className="text-small font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs">
            Tracking Report #{issue.id.slice(0, 8)}
          </span>
          <div className="flex gap-2">
            <Button
              variant={hasVoted ? "primary" : "ghost"}
              size="sm"
              onClick={handleVote}
              className={cn(
                "transition-all duration-200",
                hasVoted 
                  ? "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100/80" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <ArrowUp size={16} className={cn(hasVoted && "fill-current")} />
              <span className="ml-1 text-xs font-bold">{issue.upvotes}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Persistent Horizontal Status Tracker */}
      <div className="bg-white border-b border-slate-100 py-5 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between relative overflow-x-auto pb-2 scrollbar-none">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 -translate-y-1/2 z-0 hidden md:block" />
            <div
              className="absolute top-4 left-4 h-0.5 bg-green-500 -translate-y-1/2 z-0 transition-all duration-300 hidden md:block"
              style={{ width: `${(activeStageIndex / (STAGES.length - 1)) * 100}%` }}
            />

            {STAGES.map((stage, idx) => {
              const IconComp = stage.icon;
              const isPast = idx < activeStageIndex;
              const isCurrent = idx === activeStageIndex;
              
              return (
                <div key={stage.id} className="flex flex-col items-center z-10 shrink-0 px-2 sm:px-0">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                      isPast
                        ? "bg-green-600 text-white"
                        : isCurrent
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : "bg-white border-2 border-slate-200 text-slate-400"
                    )}
                  >
                    {isPast ? <CheckCircle2 size={16} /> : <IconComp size={14} />}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold mt-1 text-center truncate w-20 hidden md:block",
                      isCurrent ? "text-blue-700" : isPast ? "text-green-700" : "text-gray-400"
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Timeline & Details (Unified Source of Truth) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Issue Header Card */}
            <Card padding="lg" className="shadow-sm border-slate-100 bg-white">
              <div className="flex items-start gap-4">
                <CategoryIcon category={issue.category} size={24} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h1 className="text-h2 font-extrabold text-gray-900 leading-tight">{issue.title}</h1>
                    <Badge variant={issue.priority === "critical" ? "danger" : issue.priority === "high" ? "warning" : "default"}>
                      {issue.priority} priority
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-small text-gray-500">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin size={13} className="text-slate-400" />
                      {issue.location.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-slate-400" />
                      {formatTimeAgo(issue.reportedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 text-body text-gray-600 leading-relaxed border-t border-slate-50 pt-4">
                {issue.description}
              </div>

              {/* Photos Grid */}
              {issue.photos && issue.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-5">
                  {issue.photos.map((photoUrl: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative aspect-video rounded-xl overflow-hidden bg-slate-50 border border-slate-100 hover:opacity-95 transition-opacity"
                    >
                      <img src={photoUrl} alt={`Attachment ${idx + 1}`} className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Live Journey Timeline */}
            <Card padding="lg" className="shadow-sm border-slate-100 bg-white">
              <h2 className="text-h3 font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="text-blue-600" size={20} />
                Live Issue Lifecycle
              </h2>

              <div className="relative border-l border-slate-100 ml-4 pl-8 space-y-8">
                
                {/* 1. Submission */}
                <div className="relative">
                  <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center justify-center z-10 shadow-sm">
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <h4 className="text-small font-bold text-slate-800">Report Submitted</h4>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      Submitted by {issue.reportedBy?.name || "Citizen"} · {formatDate(issue.reportedAt)}
                    </p>
                    {aiEvent && (
                      <div className="text-[11px] bg-blue-50/60 border border-blue-100 text-blue-800 rounded-lg p-2.5 mt-2 max-w-md">
                        <span className="font-bold block mb-0.5">🤖 Civic AI Vision Audit:</span>
                        {aiEvent.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Verification */}
                <div className="relative">
                  <div
                    className={cn(
                      "absolute -left-[41px] top-0 w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-sm border",
                      activeStageIndex >= 1
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-white text-slate-400 border-slate-200"
                    )}
                  >
                    {activeStageIndex > 1 ? <CheckCircle2 size={14} /> : <ThumbsUp size={12} />}
                  </div>
                  <div>
                    <h4 className="text-small font-bold text-slate-800">Community Verification</h4>
                    
                    {/* Enhanced Verification Widget */}
                    <div className="mt-2 rounded-xl border max-w-md overflow-hidden">
                      {/* Header */}
                      <div className={cn(
                        "px-4 py-3 flex items-center gap-2",
                        (issue.verificationCount || 0) >= 3
                          ? "bg-green-50 border-b border-green-100"
                          : "bg-slate-50 border-b border-slate-100"
                      )}>
                        {(issue.verificationCount || 0) >= 3 ? (
                          <>
                            <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                              <CheckCircle2 size={12} className="text-white" />
                            </div>
                            <span className="text-xs font-bold text-green-700">Verified by 3 Nearby People</span>
                          </>
                        ) : (
                          <>
                            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                              <Clock size={12} className="text-amber-600" />
                            </div>
                            <span className="text-xs font-bold text-slate-600">Awaiting Community Verification</span>
                          </>
                        )}
                      </div>

                      {/* People verification icons */}
                      <div className="px-4 py-4 bg-white">
                        <div className="flex items-center justify-center gap-4 mb-4">
                          {[1, 2, 3].map((personIdx) => {
                            const isVerified = (issue.verificationCount || 0) >= personIdx;
                            return (
                              <div key={personIdx} className="flex flex-col items-center gap-1.5">
                                <div
                                  className={cn(
                                    "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500",
                                    isVerified
                                      ? "bg-green-100 text-green-600 ring-2 ring-green-200 scale-105"
                                      : "bg-slate-100 text-slate-300 border-2 border-dashed border-slate-200"
                                  )}
                                >
                                  {isVerified ? (
                                    <CheckCircle2 size={20} className="drop-shadow-sm" />
                                  ) : (
                                    <User size={18} />
                                  )}
                                </div>
                                <span className={cn(
                                  "text-[10px] font-bold",
                                  isVerified ? "text-green-600" : "text-slate-400"
                                )}>
                                  {isVerified ? "Confirmed" : `Person ${personIdx}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                            <span>Verification Progress</span>
                            <span className={cn(
                              (issue.verificationCount || 0) >= 3 ? "text-green-600" : "text-blue-600"
                            )}>
                              {Math.min(issue.verificationCount || 0, 3)} / 3
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-700 ease-out",
                                (issue.verificationCount || 0) >= 3 ? "bg-green-500" : "bg-blue-500"
                              )}
                              style={{ width: `${Math.min(((issue.verificationCount || 0) / 3) * 100, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Verify Button (mock: same user can click multiple times) */}
                        {(issue.verificationCount || 0) < 3 && (
                          <Button
                            size="sm"
                            onClick={handleVerify}
                            disabled={verifyMutation.isPending}
                            className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          >
                            {verifyMutation.isPending ? (
                              <Loader2 size={14} className="animate-spin mr-1.5" />
                            ) : (
                              <ThumbsUp size={14} className="mr-1.5" />
                            )}
                            Verify This Issue ({Math.min(issue.verificationCount || 0, 3)}/3)
                          </Button>
                        )}

                        {/* Celebration when fully verified */}
                        {(issue.verificationCount || 0) >= 3 && (
                          <div className="bg-green-50 border border-green-100 rounded-lg py-2.5 px-3 text-center">
                            <span className="text-xs font-bold text-green-700 flex items-center justify-center gap-1.5">
                              <Award size={14} className="text-green-600" />
                              Issue now visible on the public map!
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Municipality processing */}
                <div className="relative">
                  <div
                    className={cn(
                      "absolute -left-[41px] top-0 w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-sm border",
                      activeStageIndex >= 3
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-white text-slate-400 border-slate-200"
                    )}
                  >
                    {activeStageIndex > 3 ? <CheckCircle2 size={14} /> : <Shield size={12} />}
                  </div>
                  <div>
                    <h4 className="text-small font-bold text-slate-800">Municipality Review</h4>
                    {activeStageIndex >= 3 && (
                      <div className="space-y-1.5 mt-1">
                        <p className="text-[12px] text-slate-500">
                          ✓ AI Review Complete (Priority: <span className="font-bold text-red-600 uppercase">{issue.priority}</span>)<br/>
                          ✓ Routed to municipal department queue.<br/>
                          ✓ Work order generated: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">WO-{issue.id.slice(0, 6).toUpperCase()}</span>
                        </p>
                        {aiEvent && (
                          <div className="text-[11px] bg-blue-50/60 border border-blue-100 text-blue-800 rounded-lg p-2.5 mt-2 max-w-md">
                            <span className="font-bold block mb-0.5">🤖 Civic AI Vision Audit:</span>
                            {aiEvent.description}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Dispatch */}
                <div className="relative">
                  <div
                    className={cn(
                      "absolute -left-[41px] top-0 w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-sm border",
                      activeStageIndex >= 5
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-white text-slate-400 border-slate-200"
                    )}
                  >
                    {activeStageIndex > 5 ? <CheckCircle2 size={14} /> : <Truck size={12} />}
                  </div>
                  <div>
                    <h4 className="text-small font-bold text-slate-800">Dispatch & Crew Assignment</h4>
                    {activeStageIndex >= 5 && (
                      <div className="mt-2 bg-slate-50 rounded-xl p-3.5 border border-slate-100 max-w-md flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            CR
                          </div>
                          <div>
                            <span className="text-[11px] uppercase font-bold text-slate-400 block">Assigned Crew</span>
                            <span className="text-[12px] font-bold text-slate-700">Municipal Repair Team {issue.assignedTo || "#4"}</span>
                          </div>
                        </div>
                        {crewEta !== null && issue.status === "dispatched" && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">ETA</span>
                            <span className="text-[12px] font-bold text-blue-600">{crewEta} mins away</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Repair status */}
                <div className="relative">
                  <div
                    className={cn(
                      "absolute -left-[41px] top-0 w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-sm border",
                      activeStageIndex >= 6
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-white text-slate-400 border-slate-200"
                    )}
                  >
                    {activeStageIndex > 6 ? <CheckCircle2 size={14} /> : <Wrench size={12} />}
                  </div>
                  <div>
                    <h4 className="text-small font-bold text-slate-800">Repair Status</h4>
                    {activeStageIndex >= 6 && (
                      <p className="text-[12px] text-slate-500 mt-1">
                        🛠️ {issue.status === "repair" ? "Crews are currently on-site patching the damage." : "Maintenance crew successfully resolved the damage."}
                      </p>
                    )}
                  </div>
                </div>

                {/* 6. Resolution & Celebration */}
                <div className="relative">
                  <div
                    className={cn(
                      "absolute -left-[41px] top-0 w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-sm border",
                      activeStageIndex >= 7
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-white text-slate-400 border-slate-200"
                    )}
                  >
                    <CheckCircle2 size={12} />
                  </div>
                  <div>
                    <h4 className="text-small font-bold text-slate-800">Resolution</h4>
                    {activeStageIndex >= 7 && (
                      <div className="mt-3 bg-green-50/20 border border-green-100 rounded-2xl p-5 max-w-md space-y-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <Award size={18} />
                          <span className="text-small font-bold">Issue Resolved!</span>
                        </div>
                        <p className="text-[12px] text-green-800/80 leading-snug">
                          The municipal dispatch confirmed the fix on {formatDate(issue.updatedAt || new Date())}.
                        </p>

                        {/* Satisfaction questionnaire */}
                        {!feedbackSent ? (
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-green-100/50">
                            <span className="text-[11px] font-bold text-slate-600 block mb-2">Rate this resolution</span>
                            <div className="flex items-center justify-between gap-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  onClick={() => setSatisfaction(rating)}
                                  className={cn(
                                    "w-8 h-8 rounded-full border text-xs font-bold transition-all cursor-pointer",
                                    satisfaction === rating
                                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                                  )}
                                >
                                  {rating}
                                </button>
                              ))}
                            </div>
                            <Button size="sm" className="w-full mt-3 font-semibold" onClick={handleSendFeedback} disabled={satisfaction === null}>
                              Submit Feedback
                            </Button>
                          </div>
                        ) : (
                          <div className="text-xs text-green-700 font-bold bg-green-50 py-2 px-3 rounded-lg text-center flex items-center justify-center gap-1.5">
                            <Heart size={14} className="fill-green-600 stroke-green-600" />
                            Thank you for your rating!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </Card>

            {/* Comments / Community Feed */}
            <Card padding="lg" className="shadow-sm border-slate-100 bg-white">
              <h2 className="text-h3 font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle size={18} className="text-slate-400" />
                Community Updates & Comments ({commentsList.length})
              </h2>

              {commentsList.length === 0 ? (
                <p className="text-small text-gray-400 text-center py-6">
                  No discussion threads yet. Post a comment or question.
                </p>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {commentsList.map((comment: any) => (
                    <div
                      key={comment.id}
                      className={cn(
                        "flex gap-3 text-left",
                        comment.isOfficial && "bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/30"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold",
                          comment.isOfficial ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {comment.userName ? comment.userName.charAt(0) : "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[12px] font-bold text-slate-900">
                            {comment.userName || "User"}
                          </span>
                          {comment.isOfficial && (
                            <Badge variant="primary" className="text-[8px] py-0 uppercase">
                              Official
                            </Badge>
                          )}
                          <span className="text-[10px] text-gray-400">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-600 leading-snug">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <input
                  placeholder="Ask a question or request updates..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePostComment();
                  }}
                  className="flex-1 h-9 px-3 rounded-lg bg-slate-50/50 border border-slate-200 text-small text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                />
                <Button size="sm" onClick={handlePostComment} disabled={commentMutation.isPending}>
                  {commentMutation.isPending ? "..." : "Send"}
                </Button>
              </div>
            </Card>

          </div>

          {/* Map Location Sidebar Card */}
          <div className="space-y-4">
            
            {/* Geo Location Map */}
            <Card padding="none" className="overflow-hidden shadow-sm border-slate-100 bg-white">
              <div className="h-[180px] bg-[#f2efe9] relative">
                <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                  <defs>
                    <pattern id="detail-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e8e4dd" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#detail-grid)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                    <MapPin size={16} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="p-4 text-left">
                <h4 className="text-[12px] font-bold text-slate-800 flex items-center gap-1 mb-1">
                  <MapPin size={13} className="text-blue-600" />
                  Issue Location
                </h4>
                <div className="text-[12px] text-gray-700 leading-snug">
                  {issue.location.address}
                </div>
                {issue.location.neighborhood && (
                  <div className="text-[10px] text-gray-400 mt-1 font-semibold">
                    Neighborhood: {issue.location.neighborhood}
                  </div>
                )}
              </div>
            </Card>

            {/* Reporter Card */}
            {issue.reportedBy && (
              <Card padding="md" className="shadow-sm border-slate-100 bg-white text-left">
                <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-2.5">Citizen Reporter</h3>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-100">
                    {issue.reportedBy.name ? issue.reportedBy.name.charAt(0) : "U"}
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-gray-900">
                      {issue.reportedBy.name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                      {issue.reportedBy.issuesReported || 0} issues reported
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Verification Stats Card */}
            <Card padding="md" className="shadow-sm border-slate-100 bg-white text-left">
              <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Social Validation</h3>
              <div className="flex items-center justify-between text-slate-600 text-xs">
                <span>Total Confirmations</span>
                <span className="font-bold text-slate-900">{issue.upvotes || 0}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                Issues with higher confirmations are fast-tracked by municipal department heads.
              </p>
            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
