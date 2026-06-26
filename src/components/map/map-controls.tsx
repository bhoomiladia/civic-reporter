"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Locate, Layers } from "lucide-react";

interface MapControlsProps {
  className?: string;
}

export function MapControls({ className }: MapControlsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        className
      )}
    >
      {/* Zoom controls */}
      <div className="flex flex-col bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <button
          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors active:bg-gray-100"
          aria-label="Zoom in"
        >
          <Plus size={18} />
        </button>
        <div className="h-px bg-gray-200" />
        <button
          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors active:bg-gray-100"
          aria-label="Zoom out"
        >
          <Minus size={18} />
        </button>
      </div>

      {/* Location button */}
      <button
        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors active:bg-gray-100"
        aria-label="Go to my location"
      >
        <Locate size={18} />
      </button>

      {/* Layers button */}
      <button
        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors active:bg-gray-100"
        aria-label="Toggle map layers"
      >
        <Layers size={18} />
      </button>
    </div>
  );
}

interface FloatingActionButtonProps {
  onClick?: () => void;
  className?: string;
}

export function FloatingActionButton({
  onClick,
  className,
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        "rounded-full shadow-lg hover:shadow-xl",
        "h-14 px-6 gap-2",
        "transition-all duration-normal",
        "active:scale-95",
        className
      )}
      aria-label="Report an issue"
    >
      <Plus size={20} />
      <span className="font-semibold">Report</span>
    </Button>
  );
}
