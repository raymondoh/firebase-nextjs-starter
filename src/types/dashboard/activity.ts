// types/dashboard/activity.ts
import type { SerializedActivity } from "../firebase/activity";
import { Timestamp } from "firebase/firestore";

//
// 🔷 Shared Activity Types
//

export interface Activity {
  id: string;
  userId: string;
  action: string;
  timestamp: Date | string | number | null | undefined;
  details?: string;
  userEmail?: string;
}

//
// 🔷 System Info
//

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

//
// 🔷 Admin Components Props (Grouped at the top as requested)
//

export interface AdminActivityLogWrapperProps {
  limit?: number;
  showFilters?: boolean;
  showHeader?: boolean;
  showViewAll?: boolean;
  viewAllUrl?: string;

  className?: string;
}

export interface AdminActivityPageClientProps {
  initialData?: SerializedActivity[];
}

//
// 🔷 Generic Activity Log Props
//

export interface ActivityLogProps {
  userId: string;
  limit?: number;
  showFilters?: boolean;
  showHeader?: boolean;
}

export interface ActivityLogClientProps {
  activities: SerializedActivity[];
  showFilters: boolean;
  isRefreshing?: boolean;
}
