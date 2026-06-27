import type { IssueCategory, IssuePriority, IssueStatus, UserRole } from './types';

export const APP_NAME = 'CIVIC Reporter';

export const USER_ROLES: Record<UserRole, { label: string; level: number }> = {
  citizen: { label: 'Citizen', level: 0 },
  worker: { label: 'Worker', level: 1 },
  municipality: { label: 'Municipality', level: 2 },
  admin: { label: 'Admin', level: 3 },
};

export const ISSUE_STATUSES: Record<IssueStatus, { label: string; color: string }> = {
  reported: { label: 'Reported', color: '#2563eb' },
  verification: { label: 'Community Verification', color: '#6366f1' },
  verified: { label: 'Verified', color: '#06b6d4' },
  review: { label: 'Municipality Review', color: '#8b5cf6' },
  assigned: { label: 'Assigned', color: '#f59e0b' },
  dispatched: { label: 'Crew Dispatched', color: '#ef4444' },
  repair: { label: 'Repair In Progress', color: '#f97316' },
  resolved: { label: 'Resolved', color: '#10b981' },
  closed: { label: 'Closed', color: '#6b7280' },
};

export const ISSUE_PRIORITIES: Record<IssuePriority, { label: string; value: number }> = {
  low: { label: 'Low', value: 0 },
  medium: { label: 'Medium', value: 1 },
  high: { label: 'High', value: 2 },
  critical: { label: 'Critical', value: 3 },
};

export const ISSUE_CATEGORIES: Record<
  IssueCategory,
  { label: string; icon: string; color: string; bgColor: string; description: string }
> = {
  pothole: { label: 'Pothole', icon: 'circle-alert', color: '#dc2626', bgColor: '#fef2f2', description: 'Road damage, potholes, cracks' },
  streetlight: { label: 'Street Light', icon: 'lightbulb', color: '#d97706', bgColor: '#fffbeb', description: 'Broken or flickering street lights' },
  graffiti: { label: 'Graffiti', icon: 'paint-bucket', color: '#7c3aed', bgColor: '#f5f3ff', description: 'Unwanted graffiti or vandalism' },
  water_leak: { label: 'Water Leak', icon: 'droplets', color: '#2563eb', bgColor: '#eff6ff', description: 'Water main breaks, leaks' },
  sidewalk: { label: 'Sidewalk', icon: 'footprints', color: '#737373', bgColor: '#fafafa', description: 'Damaged or obstructed sidewalks' },
  trash: { label: 'Illegal Dumping', icon: 'trash-2', color: '#16a34a', bgColor: '#f0fdf4', description: 'Illegal dumping, overflowing bins' },
  noise: { label: 'Noise', icon: 'volume-2', color: '#ea580c', bgColor: '#fff7ed', description: 'Excessive noise complaints' },
  traffic_sign: { label: 'Traffic Sign', icon: 'triangle-alert', color: '#ca8a04', bgColor: '#fefce8', description: 'Damaged or missing signs' },
  drainage: { label: 'Drainage', icon: 'waves', color: '#0891b2', bgColor: '#ecfeff', description: 'Blocked drains, flooding' },
  park: { label: 'Park & Green', icon: 'trees', color: '#15803d', bgColor: '#f0fdf4', description: 'Park maintenance, fallen trees' },
  other: { label: 'Other', icon: 'message-circle', color: '#525252', bgColor: '#f5f5f5', description: 'Other civic issues' },
};

/** Valid status transitions for issue lifecycle */
export const STATUS_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  reported: ['verification', 'review', 'closed'],
  verification: ['verified', 'closed'],
  verified: ['review', 'closed'],
  review: ['assigned', 'closed'],
  assigned: ['dispatched', 'closed'],
  dispatched: ['repair', 'closed'],
  repair: ['resolved', 'closed'],
  resolved: ['closed', 'repair'],
  closed: ['reported'],
};

export const EARTH_RADIUS_KM = 6371;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MAX_COMMENT_LENGTH = 2000;
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const NEARBY_DEFAULT_RADIUS_KM = 5;
export const NEARBY_MAX_RADIUS_KM = 50;
