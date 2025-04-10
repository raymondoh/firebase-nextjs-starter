import { getUserActivityLogs, getAllActivityLogs } from "@/firebase/actions";
import { serializeData } from "@/utils/serializeData";
import { auth } from "@/auth";
import type { FetchActivityLogsParams, FetchActivityLogsResponse } from "@/types/dashboard/activity";
import type { SerializedActivity } from "@/types/firebase/activity";

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
  console.log("[AdminDashboardOverviewPage] Result:", result);
  if (!result.success || !result.activities) {
    return { success: false, error: result.error || "Failed to fetch logs" };
  }

  // ⚠️ You may want to enrich logs here (e.g., add displayName or userEmail) before casting
  const serialized = serializeData(result.activities) as SerializedActivity[];
  const logs: SerializedActivity[] = Array.isArray(result.activities) ? result.activities : [];
  console.log("[AdminDashboardOverviewPage] Logs length:", logs.length);

  return {
    success: true,
    activities: serialized
  };
}
