// src/actions/dashboard/activity-logs.ts
"use server";

import { getUserActivityLogs, getAllActivityLogs } from "@/firebase/actions";
import type { SerializedActivity, ActivityLogWithId } from "@/types/firebase/activity";
import { serializeData } from "@/utils/serializeData";
import { auth } from "@/auth";

interface FetchActivityLogsParams {
  limit?: number;
  startAfter?: string;
  type?: string;
}
export async function fetchActivityLogs({
  limit = 5,
  startAfter,
  type
}: FetchActivityLogsParams): Promise<SerializedActivity[] | { error: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const isAdmin = session.user.role === "admin";

  const result = isAdmin
    ? await getAllActivityLogs(limit, startAfter, type)
    : await getUserActivityLogs(limit, startAfter, type);

  if (!result.success || !result.activities) {
    return { error: result.error || "Failed to fetch logs" };
  }

  // 🪄 Use your serializeData utility here!
  const serialized = serializeData(
    result.activities.map((activity: ActivityLogWithId) => ({
      id: activity.id,
      userId: activity.userId,
      userEmail: activity.userEmail ?? "Unknown",
      type: activity.type,
      description: activity.description,
      status: activity.status,
      timestamp: activity.timestamp, // this will be converted by serializeData
      ipAddress: activity.ipAddress ?? "",
      location: activity.location ?? "",
      device: activity.device ?? "",
      deviceType: activity.deviceType ?? "",
      metadata: activity.metadata ?? {}
    }))
  );

  return serialized;
}
