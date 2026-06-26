"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import type { Issue } from "@/lib/types";

interface MapPlaceholderProps {
  issuesList?: Issue[];
  onPinClick?: (issue: Issue) => void;
  selectedIssueId?: string;
  className?: string;
}

export function MapPlaceholder({
  issuesList = [],
  onPinClick,
  selectedIssueId,
  className,
}: MapPlaceholderProps) {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  const handlePinClick = useCallback(
    (issue: Issue) => {
      onPinClick?.(issue);
    },
    [onPinClick]
  );

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden",
        "bg-[#f2efe9]",
        className
      )}
      role="img"
      aria-label="Map showing reported issues"
    >
      {/* Grid background simulating streets */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="grid-major"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 120 0 L 0 0 0 120"
              fill="none"
              stroke="#e8e4dd"
              strokeWidth="2"
            />
          </pattern>
          <pattern
            id="grid-minor"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#ece9e3"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-minor)" />
        <rect width="100%" height="100%" fill="url(#grid-major)" />

        {/* Simulate some "roads" */}
        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#fff" strokeWidth="8" opacity="0.7" />
        <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#fff" strokeWidth="6" opacity="0.6" />
        <line x1="40%" y1="0" x2="40%" y2="100%" stroke="#fff" strokeWidth="8" opacity="0.7" />
        <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#fff" strokeWidth="6" opacity="0.6" />
        <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#fff" strokeWidth="4" opacity="0.5" />
        <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#fff" strokeWidth="4" opacity="0.5" />

        {/* "Park" area */}
        <rect x="60%" y="15%" width="18%" height="20%" rx="8" fill="#e8f0e0" opacity="0.6" />
        <rect x="10%" y="55%" width="15%" height="18%" rx="6" fill="#e8f0e0" opacity="0.5" />
      </svg>

      {/* Neighborhood labels */}
      <div className="absolute top-[18%] left-[30%] text-[10px] tracking-[0.15em] uppercase text-gray-400/60 font-medium select-none pointer-events-none">
        Downtown
      </div>
      <div className="absolute top-[48%] left-[60%] text-[10px] tracking-[0.15em] uppercase text-gray-400/60 font-medium select-none pointer-events-none">
        Midtown
      </div>
      <div className="absolute top-[72%] left-[15%] text-[10px] tracking-[0.15em] uppercase text-gray-400/60 font-medium select-none pointer-events-none">
        West End
      </div>
      <div className="absolute top-[12%] left-[62%] text-[9px] tracking-[0.12em] uppercase text-green-600/30 font-medium select-none pointer-events-none">
        Park District
      </div>

      {/* Issue pins */}
      {issuesList.map((issue, idx) => {
        // Generate pseudo-coordinates deterministically based on ID characters if not explicitly within bounds
        const hash = issue.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const x = 15 + (hash % 70); // bounds [15, 85]
        const y = 15 + ((hash >> 1) % 65); // bounds [15, 80]

        const catDef = CATEGORIES.find((c) => c.id === issue.category);
        if (!catDef) return null;

        const isSelected = selectedIssueId === issue.id;
        const isHovered = hoveredPin === issue.id;

        return (
          <button
            key={issue.id}
            className={cn(
              "absolute flex flex-col items-center cursor-pointer",
              "transition-all duration-normal ease-out",
              "group",
              (isSelected || isHovered) ? "z-20" : "z-10"
            )}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -100%) ${
                isSelected ? "scale(1.2)" : isHovered ? "scale(1.1)" : "scale(1)"
              }`,
            }}
            onClick={() => handlePinClick(issue)}
            onMouseEnter={() => setHoveredPin(issue.id)}
            onMouseLeave={() => setHoveredPin(null)}
            aria-label={`${issue.title} - ${catDef.label}`}
          >
            {/* Pin shape */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                "shadow-md border-2 border-white",
                "transition-shadow duration-fast",
                (isSelected || isHovered) && "shadow-lg"
              )}
              style={{ backgroundColor: catDef.color }}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            {/* Pin stem */}
            <div
              className="w-0.5 h-2 -mt-0.5"
              style={{ backgroundColor: catDef.color }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full opacity-30 -mt-0.5"
              style={{ backgroundColor: catDef.color }}
            />

            {/* Tooltip */}
            {(isHovered || isSelected) && (
              <div
                className={cn(
                  "absolute bottom-full mb-2",
                  "bg-white rounded-lg shadow-lg border border-gray-200",
                  "px-3 py-2 whitespace-nowrap",
                  "text-small font-medium text-gray-900",
                  "pointer-events-none"
                )}
              >
                {issue.title}
                <div className="text-[11px] text-gray-500 font-normal mt-0.5">
                  {issue.location.address}
                </div>
              </div>
            )}
          </button>
        );
      })}

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 text-[9px] text-gray-400/50 select-none pointer-events-none">
        OpenStreetMap grid simulation · Live Backend Data
      </div>
    </div>
  );
}
