"use server";

import { adminDb } from "../admin";
import { auth } from "@/auth";
import { Timestamp } from "firebase-admin/firestore";
// Import statement for firebase/utils/activity.ts
import { ActivityLogData, GetUserActivityLogsResult, LogActivityResult } from "@/types/firebase/activity";

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
 * Get user activity logs with pagination support
 * @param limit - The maximum number of logs to retrieve
 * @param startAfter - The document ID to start after for pagination
 * @param type - Filter by activity type
 */
export async function getUserActivityLogs(
  limit = 100,
  startAfter?: string,
  type?: string
): Promise<GetUserActivityLogsResult> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  try {
    // Start building the query
    let query = adminDb.collection("activityLogs").where("userId", "==", session.user.id);

    // Add type filter if provided
    if (type) {
      query = query.where("type", "==", type);
    }

    // Add ordering
    query = query.orderBy("timestamp", "desc");

    // Add pagination if startAfter is provided
    if (startAfter) {
      const startAfterDoc = await adminDb.collection("activityLogs").doc(startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    // Add limit
    query = query.limit(limit);

    // Execute query
    const logsSnapshot = await query.get();

    return logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GetUserActivityLogsResult;
  } catch (error) {
    console.error("Error getting activity logs:", error instanceof Error ? error.message : String(error));
    return [];
  }
}
