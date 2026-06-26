"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { IssueCard } from "@/components/issues/issue-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/status-badge";
import { mockIssues } from "@/lib/mock-data";
import { CATEGORIES, STATUS_CONFIG } from "@/lib/constants";
import { useIssues } from "@/hooks/use-issues";
import type { IssueCategory, IssueStatus } from "@/lib/types";
import { Search, SlidersHorizontal, Grid3X3, List, FileSearch, Loader2 } from "lucide-react";

export default function IssuesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<IssueCategory[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<IssueStatus[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Query options passed directly to backend repository logic
  const { data: response, isLoading } = useIssues({
    category: selectedCategories.join(','),
    status: selectedStatuses.join(','),
    q: searchQuery || undefined,
  });

  const issuesList = response?.data || [];

  const toggleCategory = (cat: IssueCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleStatus = (status: IssueStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  return (
    <div className="min-h-[calc(100vh-56px)] lg:min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-h1 text-gray-900 mb-1">Issues</h1>
          <p className="text-body text-gray-500">
            Browse and track all reported civic issues.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Search + controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Input
            placeholder="Search issues..."
            icon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <div className="hidden sm:flex bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "w-9 h-9 flex items-center justify-center transition-colors cursor-pointer",
                  viewMode === "list"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                )}
                aria-label="List view"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "w-9 h-9 flex items-center justify-center transition-colors cursor-pointer",
                  viewMode === "grid"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                )}
                aria-label="Grid view"
              >
                <Grid3X3 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-6">
          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mr-2 self-center">
              Category
            </span>
            {CATEGORIES.slice(0, 8).map((cat) => {
              const isActive = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[12px] font-medium",
                    "transition-all duration-fast cursor-pointer border",
                    isActive
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Status filters */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mr-2 self-center">
              Status
            </span>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const isActive = selectedStatuses.includes(key as IssueStatus);
              return (
                <button
                  key={key}
                  onClick={() => toggleStatus(key as IssueStatus)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[12px] font-medium",
                    "transition-all duration-fast cursor-pointer border",
                    isActive
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {config.label}
                </button>
              );
            })}
          </div>

          {(selectedCategories.length > 0 || selectedStatuses.length > 0) && (
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedStatuses([]);
              }}
              className="text-small text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-small text-gray-500">
            {issuesList.length} issue{issuesList.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Issues */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
            <p className="text-small text-gray-500">Loading issues...</p>
          </div>
        ) : issuesList.length === 0 ? (
          <EmptyState
            icon={<FileSearch size={24} />}
            title="No issues found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategories([]);
                  setSelectedStatuses([]);
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid sm:grid-cols-2 gap-3"
                : "space-y-2"
            )}
          >
            {issuesList.map((issue: any) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                compact={viewMode === "list"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
