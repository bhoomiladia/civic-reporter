import type { CategoryDefinition } from "./types";

export const APP_NAME = "CIVIC Reporter";
export const APP_DESCRIPTION = "Report and track civic issues in your community";

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: "pothole",
    label: "Pothole",
    icon: "circle-alert",
    color: "#dc2626",
    bgColor: "#fef2f2",
    description: "Road damage, potholes, cracks",
  },
  {
    id: "streetlight",
    label: "Street Light",
    icon: "lightbulb",
    color: "#d97706",
    bgColor: "#fffbeb",
    description: "Broken or flickering street lights",
  },
  {
    id: "graffiti",
    label: "Graffiti",
    icon: "paint-bucket",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    description: "Unwanted graffiti or vandalism",
  },
  {
    id: "water_leak",
    label: "Water Leak",
    icon: "droplets",
    color: "#2563eb",
    bgColor: "#eff6ff",
    description: "Water main breaks, leaks",
  },
  {
    id: "sidewalk",
    label: "Sidewalk",
    icon: "footprints",
    color: "#737373",
    bgColor: "#fafafa",
    description: "Damaged or obstructed sidewalks",
  },
  {
    id: "trash",
    label: "Illegal Dumping",
    icon: "trash-2",
    color: "#16a34a",
    bgColor: "#f0fdf4",
    description: "Illegal dumping, overflowing bins",
  },
  {
    id: "noise",
    label: "Noise",
    icon: "volume-2",
    color: "#ea580c",
    bgColor: "#fff7ed",
    description: "Excessive noise complaints",
  },
  {
    id: "traffic_sign",
    label: "Traffic Sign",
    icon: "triangle-alert",
    color: "#ca8a04",
    bgColor: "#fefce8",
    description: "Damaged or missing signs",
  },
  {
    id: "drainage",
    label: "Drainage",
    icon: "waves",
    color: "#0891b2",
    bgColor: "#ecfeff",
    description: "Blocked drains, flooding",
  },
  {
    id: "park",
    label: "Park & Green",
    icon: "trees",
    color: "#15803d",
    bgColor: "#f0fdf4",
    description: "Park maintenance, fallen trees",
  },
  {
    id: "other",
    label: "Other",
    icon: "message-circle",
    color: "#525252",
    bgColor: "#f5f5f5",
    description: "Other civic issues",
  },
];

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  reported: { label: "Reported", color: "#2563eb", bgColor: "#eff6ff" },
  verification: { label: "Community Verification", color: "#6366f1", bgColor: "#e0e7ff" },
  verified: { label: "Verified", color: "#06b6d4", bgColor: "#ecfeff" },
  review: { label: "Municipality Review", color: "#8b5cf6", bgColor: "#f5f3ff" },
  assigned: { label: "Assigned", color: "#f59e0b", bgColor: "#fef3c7" },
  dispatched: { label: "Crew Dispatched", color: "#ef4444", bgColor: "#fee2e2" },
  repair: { label: "Repair In Progress", color: "#f97316", bgColor: "#ffedd5" },
  resolved: { label: "Resolved", color: "#10b981", bgColor: "#d1fae5" },
  closed: { label: "Closed", color: "#6b7280", bgColor: "#f3f4f6" },
};

export const NAV_ITEMS = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Explore Map", href: "/map", icon: "map" },
  { label: "Report", href: "/report", icon: "plus-circle" },
  { label: "Track", href: "/issues", icon: "clock" },
  { label: "Community", href: "/community", icon: "users" },
  { label: "Profile", href: "/profile", icon: "user" },
] as const;
