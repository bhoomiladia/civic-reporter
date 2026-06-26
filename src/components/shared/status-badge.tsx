"use client";

import { cn } from "@/lib/utils";
import { CATEGORIES, STATUS_CONFIG } from "@/lib/constants";
import type { IssueCategory, IssueStatus } from "@/lib/types";
import {
  CircleAlert,
  Lightbulb,
  PaintBucket,
  Droplets,
  Footprints,
  Trash2,
  Volume2,
  TriangleAlert,
  Waves,
  Trees,
  MessageCircle,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "circle-alert": CircleAlert,
  lightbulb: Lightbulb,
  "paint-bucket": PaintBucket,
  droplets: Droplets,
  footprints: Footprints,
  "trash-2": Trash2,
  "volume-2": Volume2,
  "triangle-alert": TriangleAlert,
  waves: Waves,
  trees: Trees,
  "message-circle": MessageCircle,
};

interface CategoryIconProps {
  category: IssueCategory;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

export function CategoryIcon({
  category,
  size = 18,
  showLabel = false,
  className,
}: CategoryIconProps) {
  const catDef = CATEGORIES.find((c) => c.id === category);
  if (!catDef) return null;

  const IconComponent = iconMap[catDef.icon];
  if (!IconComponent) return null;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="inline-flex items-center justify-center rounded-lg"
        style={{
          backgroundColor: catDef.bgColor,
          color: catDef.color,
          width: size + 14,
          height: size + 14,
        }}
      >
        <IconComponent size={size} />
      </span>
      {showLabel && (
        <span className="text-small font-medium text-gray-700">
          {catDef.label}
        </span>
      )}
    </span>
  );
}

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-2.5 py-0.5 rounded-full",
        "text-tiny font-medium whitespace-nowrap",
        className
      )}
      style={{ backgroundColor: config.bgColor, color: config.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
        {icon}
      </div>
      <h3 className="text-h3 text-gray-900 mb-1">{title}</h3>
      <p className="text-small text-gray-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
