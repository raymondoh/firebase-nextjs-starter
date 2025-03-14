import type { SerializedActivity } from "../firebase/activity";

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
