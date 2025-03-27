// // src/actions/dashboard/activity-logs.ts
// "use server";

// import { getUserActivityLogs } from "@/firebase/actions";
// import { auth } from "@/auth";
// import { parseServerDate } from "@/utils/date-server";
// import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
// import type { SerializedActivity } from "@/types/firebase/activity";

// interface PaginationParams {
//   limit: number;
//   startAfter?: string;
//   type?: string;
// }

// /**
//  * Server action to fetch activity logs for the current user
//  */
// export async function fetchActivityLogs(limitOrParams: number | PaginationParams = 5): Promise<SerializedActivity[]> {
//   try {
//     const session = await auth();
//     if (!session?.user?.id) {
//       throw new Error("Not authenticated");
//     }

//     let limit = 5;
//     let startAfter: string | undefined;
//     let type: string | undefined;

//     if (typeof limitOrParams === "number") {
//       limit = limitOrParams;
//     } else {
//       ({ limit, startAfter, type } = limitOrParams);
//     }

//     const logsResult = await getUserActivityLogs(limit, startAfter, type);

//     if (logsResult.success && logsResult.activities) {
//       return logsResult.activities.map(log => ({
//         ...log,
//         timestamp: parseServerDate(log.timestamp)?.toISOString() ?? new Date().toISOString()
//       }));
//     } else {
//       console.error("Error fetching activity logs:", logsResult.error);
//       return [];
//     }
//   } catch (error: unknown) {
//     console.error("Error fetching activity logs:", error);

//     if (isFirebaseError(error)) {
//       console.error("Firebase error:", firebaseError(error));
//     }

//     return [];
//   }
// }
// @/actions/dashboard/activity-logs.ts
"use server";

import { getUserActivityLogs } from "@/firebase/actions";
import type { SerializedActivity } from "@/types/firebase/activity";
import { parseServerDate } from "@/utils/date-server";
import type { ActivityLogWithId } from "@/types/firebase/activity";

interface FetchActivityLogsParams {
  limit?: number;
  startAfter?: string;
  type?: string;
}

export async function fetchActivityLogs({
  limit = 10,
  startAfter,
  type
}: FetchActivityLogsParams): Promise<SerializedActivity[] | { error: string }> {
  const result = await getUserActivityLogs(limit, startAfter, type);

  if (!result.success || !result.activities) {
    return { error: result.error || "Failed to fetch logs" };
  }

  // ✅ Map server-side timestamps and values to client-safe formats
  const serialized: SerializedActivity[] = result.activities.map((activity: ActivityLogWithId) => ({
    id: activity.id,
    userId: activity.userId,
    userEmail: activity.userEmail ?? "Unknown",
    type: activity.type,
    description: activity.description,
    status: activity.status,
    timestamp: parseServerDate(activity.timestamp)?.toISOString() ?? new Date().toISOString(),
    ipAddress: activity.ipAddress ?? "",
    location: activity.location ?? "",
    device: activity.device ?? "",
    deviceType: activity.deviceType ?? "",
    metadata: activity.metadata ?? {}
  }));

  return serialized;
}
