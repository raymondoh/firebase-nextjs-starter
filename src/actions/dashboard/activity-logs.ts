// src/actions/dashboard/activity-logs.ts
"use server";

import { getUserActivityLogs } from "@/firebase/actions";
import { auth } from "@/auth";
import { parseServerDate } from "@/utils/date-server";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import type { SerializedActivity } from "@/types/firebase/activity";

interface PaginationParams {
  limit: number;
  startAfter?: string;
  type?: string;
}

/**
 * Server action to fetch activity logs for the current user
 */
export async function fetchActivityLogs(limitOrParams: number | PaginationParams = 5): Promise<SerializedActivity[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    let limit = 5;
    let startAfter: string | undefined;
    let type: string | undefined;

    if (typeof limitOrParams === "number") {
      limit = limitOrParams;
    } else {
      ({ limit, startAfter, type } = limitOrParams);
    }

    const logsResult = await getUserActivityLogs(limit, startAfter, type);

    if (logsResult.success && logsResult.activities) {
      return logsResult.activities.map(log => ({
        ...log,
        timestamp: parseServerDate(log.timestamp)?.toISOString() ?? new Date().toISOString()
      }));
    } else {
      console.error("Error fetching activity logs:", logsResult.error);
      return [];
    }
  } catch (error: unknown) {
    console.error("Error fetching activity logs:", error);

    if (isFirebaseError(error)) {
      console.error("Firebase error:", firebaseError(error));
    }

    return [];
  }
}
