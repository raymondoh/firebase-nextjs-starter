// src/schemas/activity/log.ts
import { z } from "zod";

// Activity log schema
export const activityLogSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: z.enum([
    "login",
    "password_change",
    "email_change",
    "security_alert",
    "device_authorized",
    "data_export",
    "deletion_request"
  ]),
  description: z.string(),
  timestamp: z.date(),
  ipAddress: z.string().optional(),
  location: z.string().optional(),
  device: z.string().optional(),
  deviceType: z.string().optional(),
  status: z.enum(["success", "failed", "warning", "pending"])
});

export type ActivityLog = z.infer<typeof activityLogSchema>;
