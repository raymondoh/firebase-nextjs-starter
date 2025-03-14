import type { Timestamp } from "firebase-admin/firestore";

/**
 * Types of activities that can be logged
 */
export type ActivityType =
  | "login"
  | "logout"
  | "registration"
  | "password_reset"
  | "profile_update"
  | "email_verification"
  | "settings_change"
  // Additional types from firebase/activity.ts
  | "password_change"
  | "email_change"
  | "security_alert"
  | "device_authorized"
  | "data_export"
  | "deletion_request"
  | "deletion_completed";

/**
 * Status of an activity
 */
export type ActivityStatus =
  | "success"
  | "failure"
  // Additional statuses from firebase/activity.ts
  | "failed"
  | "warning"
  | "pending"
  | "completed";

/**
 * Activity log data as stored in Firestore
 */
export interface ActivityLogData {
  userId: string;
  type: ActivityType | string;
  description: string;
  status: ActivityStatus;
  timestamp: Timestamp;
  // Additional fields from firebase/activity.ts
  ipAddress?: string;
  location?: string;
  device?: string;
  deviceType?: string;
  metadata?: Record<string, any>;
}

/**
 * Activity log data with ID
 */
export type ActivityLogWithId = ActivityLogData & { id: string };

/**
 * Serialized activity log for client components
 * This is used when sending activity data to the client
 * where Firestore Timestamp needs to be converted to string
 */
export interface SerializedActivity {
  id: string;
  userId: string;
  type: ActivityType | string;
  description: string;
  status: ActivityStatus;
  timestamp: string | Timestamp; // Allow both ISO string and Timestamp
  ipAddress?: string;
  location?: string;
  device?: string;
  deviceType?: string;
  metadata?: Record<string, any>;
}

/**
 * Result types for activity log operations
 */
export interface LogActivityResult {
  success: boolean;
  activityId?: string;
  error?: string;
}

export interface GetUserActivityLogsResult {
  success: boolean;
  activities?: ActivityLogWithId[];
  error?: string;
}
