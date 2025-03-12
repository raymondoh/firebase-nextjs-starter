export type ActivityType =
  | "login"
  | "password_change"
  | "email_change"
  | "security_alert"
  | "device_authorized"
  | "data_export"
  | "deletion_request";

export type ActivityStatus = "success" | "failed" | "warning" | "pending";

export interface ActivityLogData {
  userId: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  ipAddress?: string;
  location?: string;
  device?: string;
  deviceType?: string;
  status: ActivityStatus;
}

export type LogActivityResult = boolean;

export type GetUserActivityLogsResult = Array<ActivityLogData & { id: string }>;
