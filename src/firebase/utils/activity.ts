// firebase/utils/activity.ts
"use server";

import { adminDb } from "../admin";
import { auth } from "@/auth";
import { Timestamp } from "firebase-admin/firestore";
import type {
  ActivityLogData,
  ActivityType,
  ActivityStatus,
  LogActivityResult,
  GetUserActivityLogsResult
} from "@/types/firebase";

/**
 * Log user activity
 * @param data - The activity data to log
 */
export async function logActivity(data: Omit<ActivityLogData, "timestamp">): Promise<LogActivityResult> {
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

/**
 * Get user activity logs
 * @param limit - The maximum number of logs to retrieve
 */
export async function getUserActivityLogs(limit = 100): Promise<GetUserActivityLogsResult> {
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
    })) as GetUserActivityLogsResult;
  } catch (error) {
    console.error("Error getting activity logs:", error instanceof Error ? error.message : String(error));
    return [];
  }
}
