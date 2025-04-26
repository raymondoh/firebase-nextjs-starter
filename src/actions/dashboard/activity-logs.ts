// import { getUserActivityLogs, getAllActivityLogs } from "@/firebase/actions";
// import { auth } from "@/auth";
// import { serializeActivityLogs } from "@/utils/serializeActivity";
// import type { FetchActivityLogsParams, FetchActivityLogsResponse } from "@/types/dashboard/activity";

// export async function fetchActivityLogs({
//   limit = 10,
//   startAfter,
//   type
// }: FetchActivityLogsParams): Promise<FetchActivityLogsResponse> {
//   const session = await auth();

//   if (!session?.user?.id) {
//     return { success: false, error: "Not authenticated" };
//   }

//   const result =
//     session.user.role === "admin"
//       ? await getAllActivityLogs(limit, startAfter, type)
//       : await getUserActivityLogs(limit, startAfter, type);

//   if (!result.success || !result.activities) {
//     return { success: false, error: result.error || "Failed to fetch logs" };
//   }

//   const serialized = serializeActivityLogs(result.activities);

//   return {
//     success: true,
//     activities: serialized
//   };
// }
import { getUserActivityLogs, getAllActivityLogs } from "@/firebase/actions";
import { auth } from "@/auth";
import { serializeActivityLogs } from "@/utils/serializeActivity";
import { logger } from "@/utils/logger";
import type { FetchActivityLogsParams, FetchActivityLogsResponse } from "@/types/dashboard/activity";

export async function fetchActivityLogs({
  limit = 10,
  startAfter,
  type
}: FetchActivityLogsParams): Promise<FetchActivityLogsResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    logger({ type: "warn", message: "Unauthorized fetchActivityLogs attempt", context: "activity" });
    return { success: false, error: "Not authenticated" };
  }

  try {
    const result =
      session.user.role === "admin"
        ? await getAllActivityLogs(limit, startAfter, type)
        : await getUserActivityLogs(limit, startAfter, type);

    if (!result.success || !result.activities) {
      logger({
        type: "error",
        message: `Failed to fetch activity logs for userId: ${session.user.id}`,
        metadata: { error: result.error },
        context: "activity"
      });
      return { success: false, error: result.error || "Failed to fetch logs" };
    }

    const serialized = serializeActivityLogs(result.activities);

    logger({
      type: "info",
      message: `Fetched ${serialized.length} activity logs for userId: ${session.user.id}`,
      context: "activity"
    });

    return {
      success: true,
      activities: serialized
    };
  } catch (error) {
    logger({
      type: "error",
      message: "Unexpected error in fetchActivityLogs",
      metadata: { error },
      context: "activity"
    });

    return { success: false, error: "Unexpected error occurred" };
  }
}
