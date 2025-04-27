// "use client";

// ================= Imports =================
import type { FetchActivityLogsParams, FetchActivityLogsResponse } from "@/types/dashboard/activity";

// ================= Client Actions =================

/**
 * Fetch activity logs from the API (client-side)
 */
export async function clientFetchActivityLogs({
  limit = 10,
  startAfter,
  type
}: FetchActivityLogsParams): Promise<FetchActivityLogsResponse> {
  try {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (startAfter) params.set("startAfter", startAfter);
    if (type) params.set("type", type);

    const response = await fetch(`/api/activity-logs?${params.toString()}`);

    if (!response.ok) {
      return { success: false, error: "Failed to fetch activity logs" };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[clientFetchActivityLogs] Error:", error);
    return { success: false, error: "Unexpected client error occurred." };
  }
}
