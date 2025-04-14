import { getUserActivityLogs, getAllActivityLogs } from "@/firebase/actions";
import { auth } from "@/auth";
import { serializeActivityLogs } from "@/utils/serializeActivity";
import type { FetchActivityLogsParams, FetchActivityLogsResponse } from "@/types/dashboard/activity";

export async function fetchActivityLogs({
  limit = 10,
  startAfter,
  type
}: FetchActivityLogsParams): Promise<FetchActivityLogsResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const result =
    session.user.role === "admin"
      ? await getAllActivityLogs(limit, startAfter, type)
      : await getUserActivityLogs(limit, startAfter, type);

  if (!result.success || !result.activities) {
    return { success: false, error: result.error || "Failed to fetch logs" };
  }

  const serialized = serializeActivityLogs(result.activities);

  return {
    success: true,
    activities: serialized
  };
}
