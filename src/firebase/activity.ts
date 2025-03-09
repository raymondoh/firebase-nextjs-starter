"use server";

import { adminDb } from "./admin";
import { auth } from "@/auth";
import { Timestamp } from "firebase-admin/firestore";

type ActivityType =
  | "login"
  | "password_change"
  | "email_change"
  | "security_alert"
  | "device_authorized"
  | "data_export"
  | "deletion_request";

type ActivityStatus = "success" | "failed" | "warning" | "pending";

interface ActivityLogData {
  userId: string;
  type: ActivityType;
  description: string;
  timestamp: Timestamp;
  ipAddress?: string;
  location?: string;
  device?: string;
  deviceType?: string;
  status: ActivityStatus;
}

// Log user activity
export async function logActivity(data: Omit<ActivityLogData, "timestamp">) {
  try {
    await adminDb.collection("activityLogs").add({
      ...data,
      timestamp: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error("Error logging activity:", error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Get user activity logs
export async function getUserActivityLogs(limit = 100) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  try {
    const logsSnapshot = await adminDb
      .collection("activityLogs")
      .where("userId", "==", session.user.id)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    return logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting activity logs:", error instanceof Error ? error.message : String(error));
    return [];
  }
}
