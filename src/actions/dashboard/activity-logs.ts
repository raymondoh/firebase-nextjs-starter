"use server";

import { getUserActivityLogs, getAllActivityLogs } from "@/firebase/actions";
import { convertTimestamps } from "@/firebase/utils/firestore";
import type { SerializedActivity, ActivityLogWithId } from "@/types/firebase/activity";
import { auth } from "@/auth";

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

  const serialized: SerializedActivity[] = result.activities.map((activity: ActivityLogWithId) => {
    const data = convertTimestamps(activity) as Partial<ActivityLogWithId>;

    return {
      id: activity.id,
      userId: activity.userId,
      userEmail: activity.userEmail ?? "Unknown",
      type: activity.type,
      description: activity.description,
      status: activity.status,
      timestamp: (data.timestamp instanceof Date ? data.timestamp : new Date()).toISOString(),
      ipAddress: activity.ipAddress ?? "",
      location: activity.location ?? "",
      device: activity.device ?? "",
      deviceType: activity.deviceType ?? "",
      metadata: activity.metadata ?? {}
    };
  });

  return serialized;
}
