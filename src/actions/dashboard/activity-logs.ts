// src/actions/dashboard/activity-logs.ts
"use server";

import { getUserActivityLogs, getAllActivityLogs } from "@/firebase/actions";
import type { SerializedActivity } from "@/types/firebase/activity";
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

  const result =
    session.user.role === "admin"
      ? await getAllActivityLogs(limit, startAfter, type)
      : await getUserActivityLogs(limit, startAfter, type);

  if (!result.success || !result.activities) {
    return { error: result.error || "Failed to fetch logs" };
  }

  // Directly serialize without redundant remapping
  return serializeData(result.activities) as SerializedActivity[];
}
