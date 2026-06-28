"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LiveMapWrapper } from "@/components/map/live-map-wrapper";
import { FloatingActionButton } from "@/components/map/map-controls";
import { IssueCard } from "@/components/issues/issue-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-media-query";
import { useIssues } from "@/hooks/use-issues";
import type { Issue, IssueCategory } from "@/lib/types";
import { Search, X, SlidersHorizontal, Loader2 } from "lucide-react";
import Link from "next/link";

export default function MapPage() {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<IssueCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const isMobile = useIsMobile();

  // Resolve issues from real backend instead of mockIssues array
  const { data: response, isLoading } = useIssues({
    category: selectedCategories.join(','),
    q: searchQuery || undefined,
  });

  const issuesList = response?.data || [];

  // Only show verified issues on the map (past the verification stage)
  const verifiedIssuesForMap = issuesList.filter(
    (issue: any) => issue.status !== 'reported' && issue.status !== 'verification'
  );

  const toggleCategory = (cat: IssueCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="relative h-[calc(100vh-0px)] lg:h-screen overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0">
        <LiveMapWrapper
          issuesList={verifiedIssuesForMap}
          onPinClick={setSelectedIssue}
          selectedIssueId={selectedIssue?.id}
        />
      </div>

      {/* Desktop Side Panel */}
      <div className="hidden lg:flex flex-col absolute left-0 top-0 bottom-0 w-[380px] z-10 bg-white/95 backdrop-blur-sm border-r border-gray-200">
        {/* Panel Header */}
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Search issues, locations..."
            icon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
          />
          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.slice(0, 6).map((cat) => {
              const isActive = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[12px] font-medium",
                    "transition-all duration-fast cursor-pointer",
                    "border",
                    isActive
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="px-2 py-1 rounded-full text-[12px] font-medium text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Issue list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-small text-gray-500">
              {issuesList.length} issues
            </span>
            <button className="text-small text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer">
              <SlidersHorizontal size={14} />
              Filter
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : (
            issuesList.map((issue: any) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className={cn(
                  selectedIssue?.id === issue.id && "ring-2 ring-blue-600 rounded-xl"
                )}
              >
                <IssueCard issue={issue} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div
        className={cn(
          "lg:hidden absolute left-0 right-0 bottom-14 z-20",
          "bg-white rounded-t-2xl shadow-xl border-t border-gray-200",
          "transition-all duration-slow ease-out",
          sheetExpanded ? "top-16" : "top-[calc(100%-220px)]"
        )}
      >
        {/* Sheet handle */}
        <button
          className="w-full flex justify-center pt-2 pb-1 cursor-pointer"
          onClick={() => setSheetExpanded(!sheetExpanded)}
          aria-label={sheetExpanded ? "Collapse sheet" : "Expand sheet"}
        >
          <div className="w-9 h-1 rounded-full bg-gray-300" />
        </button>

        {/* Sheet content */}
        <div className="px-4 pb-3">
          <Input
            placeholder="Search issues..."
            icon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
          />

          {/* Quick filters */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3">
            {CATEGORIES.slice(0, 5).map((cat) => {
              const isActive = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[12px] font-medium whitespace-nowrap",
                    "transition-all duration-fast cursor-pointer",
                    "border shrink-0",
                    isActive
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable issue list */}
        <div
          className={cn(
            "overflow-y-auto px-3 space-y-2 pb-4",
            sheetExpanded ? "max-h-[calc(100vh-280px)]" : "max-h-[60px]"
          )}
        >
          {isLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          ) : (
            issuesList.slice(0, sheetExpanded ? undefined : 1).map((issue: any) => (
              <IssueCard key={issue.id} issue={issue} compact />
            ))
          )}
          {!sheetExpanded && issuesList.length > 1 && (
            <button
              onClick={() => setSheetExpanded(true)}
              className="w-full text-center text-small text-blue-600 font-medium py-1 cursor-pointer"
            >
              See {issuesList.length - 1} more issues
            </button>
          )}
        </div>
      </div>

      {/* Selected Issue Detail (Desktop overlay) */}
      {selectedIssue && !isMobile && (
        <div className="hidden lg:block absolute left-[396px] top-4 z-20 w-[340px]">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-h3 text-gray-900 mb-1">
                  {selectedIssue.title}
                </h3>
                <p className="text-small text-gray-500">
                  {selectedIssue.location.address}
                </p>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-small text-gray-600 mb-3 line-clamp-3">
              {selectedIssue.description}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="primary" dot>
                {selectedIssue.status.replace("_", " ")}
              </Badge>
              <Badge variant="outline">{selectedIssue.upvotes} upvotes</Badge>
            </div>
            <Link
              href={`/issues/${selectedIssue.id}`}
              className="text-small font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              View full details →
            </Link>
          </div>
        </div>
      )}

      {/* FAB */}
      <Link href="/report">
        <FloatingActionButton
          className={cn(
            "fixed z-40",
            "right-4 lg:right-6",
            "bottom-20 lg:bottom-6"
          )}
        />
      </Link>
    </div>
  );
}
