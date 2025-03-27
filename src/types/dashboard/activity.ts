// types/dashboard/activity.ts
import type { SerializedActivity } from "../firebase/activity";
import { Timestamp } from "firebase/firestore";

/**
 * Props for the ActivityLog server component
 */
export interface ActivityLogProps {
  userId: string;
  limit?: number;
  showFilters?: boolean;
  showHeader?: boolean;
}

/**
 * Props for the ActivityLogClient component
 */
export interface ActivityLogClientProps {
  activities: SerializedActivity[];
  showFilters: boolean;
  isRefreshing?: boolean;
}

/**
 * Props for the ActivityLogWrapper component
 */
export interface ActivityLogWrapperProps {
  limit?: number;
  showFilters?: boolean;
  showHeader?: boolean;
  showViewAll?: boolean;
  viewAllUrl?: string;
  className?: string;
}

/**
 * Props for the ActivityPageClient component
 */
export interface ActivityPageClientProps {
  initialData?: SerializedActivity[];
}

// Existing content...

/**
 * Firestore activity log entry for display
 */
export interface Activity {
  id: string;
  userId: string;
  action: string;
  timestamp: Date | string | number | null | undefined;
  details?: string;
  userEmail?: string;
}

/**
 * Props for the AdminActivityLogWrapper component
 */
export interface AdminActivityLogWrapperProps {
  limit?: number;
  showFilters?: boolean;
  showHeader?: boolean;
  showViewAll?: boolean;
  viewAllUrl?: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalActivities: number;
}
export interface SystemAlert {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "error" | "success";
  timestamp: Date | Timestamp | null;
  resolved: boolean;
}
