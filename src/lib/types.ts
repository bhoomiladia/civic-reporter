export type IssueStatus =
  | "reported"
  | "verification"
  | "verified"
  | "review"
  | "assigned"
  | "dispatched"
  | "repair"
  | "resolved"
  | "closed";

export type IssuePriority = "low" | "medium" | "high" | "critical";

export type IssueCategory =
  | "pothole"
  | "streetlight"
  | "graffiti"
  | "water_leak"
  | "sidewalk"
  | "trash"
  | "noise"
  | "traffic_sign"
  | "drainage"
  | "park"
  | "other";

export interface Location {
  lat: number;
  lng: number;
  address: string;
  neighborhood?: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  issuesReported: number;
  issuesResolved: number;
  joinedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  isOfficial?: boolean;
}

export interface TimelineEvent {
  id: string;
  type: "created" | "acknowledged" | "assigned" | "updated" | "resolved";
  description: string;
  createdAt: Date;
  actor?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  location: Location;
  photos: string[];
  reportedBy: User;
  reportedAt: Date;
  updatedAt: Date;
  upvotes: number;
  comments: Comment[];
  timeline: TimelineEvent[];
  assignedTo?: string;
  estimatedResolution?: Date;
}

export interface CategoryDefinition {
  id: IssueCategory;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}
