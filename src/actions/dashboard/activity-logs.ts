"use server";

import { getUserActivityLogs } from "@/firebase/actions";
import { auth } from "@/auth";

interface PaginationParams {
  limit: number;
  startAfter?: string; // Document ID to start after for pagination
  type?: string; // Filter by activity type
}

/**
 * Server action to fetch activity logs for the current user
 */
export async function fetchActivityLogs(limitOrParams: number | PaginationParams = 5) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    // Parse parameters
    let limit = 5;
    let startAfter: string | undefined = undefined;
    let type: string | undefined = undefined;

    if (typeof limitOrParams === "number") {
      limit = limitOrParams;
    } else {
      limit = limitOrParams.limit;
      startAfter = limitOrParams.startAfter;
      type = limitOrParams.type;
    }

    // Use the existing getUserActivityLogs function with pagination
    const logsResult = await getUserActivityLogs(limit, startAfter, type);

    if (logsResult.success && logsResult.activities) {
      const serializedLogs = logsResult.activities.map(log => ({
        ...log,
        // Convert Firestore Timestamp to ISO string
        timestamp:
          log.timestamp && typeof log.timestamp.toDate === "function"
            ? log.timestamp.toDate().toISOString()
            : log.timestamp
      }));

      return serializedLogs;
    } else {
      console.error("Error fetching activity logs:", logsResult.error);
      return [];
    }
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }
}
