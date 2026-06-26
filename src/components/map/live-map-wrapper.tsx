"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { Issue } from "@/lib/types";

interface MapWrapperProps {
  issuesList?: Issue[];
  onPinClick?: (issue: Issue) => void;
  selectedIssueId?: string;
  className?: string;
  children?: React.ReactNode;
}

const DynamicMap = dynamic(
  () => import("./live-map").then((mod) => mod.LiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#f2efe9]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading map...</p>
      </div>
    ),
  }
);

export function LiveMapWrapper(props: MapWrapperProps) {
  return <DynamicMap {...props} />;
}
