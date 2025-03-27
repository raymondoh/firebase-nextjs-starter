"use server";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminDb } from "@/firebase/admin";
import { parseServerDate } from "@/utils/date-server";
import { ActivityLogClient } from "./ActivityLogClient";
import type { ActivityLogProps } from "@/types/dashboard";
import type { SerializedActivity } from "@/types/firebase/activity"; // ✅ Correct type

export async function ActivityLog({ userId, limit = 5, showFilters = true, showHeader = true }: ActivityLogProps) {
  let activities: SerializedActivity[] = [];

  try {
    if (userId) {
      const snapshot = await adminDb
        .collection("activityLogs")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(limit)
        .get();
      activities = snapshot.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          userId: data.userId ?? "",
          type: data.type ?? "login",
          description: data.description ?? "No description",
          status: data.status ?? "success",
          timestamp: parseServerDate(data.timestamp)?.toISOString() ?? new Date().toISOString(), // ✅ only string
          ipAddress: data.ipAddress ?? "",
          location: data.location ?? "",
          device: data.device ?? "",
          deviceType: data.deviceType ?? "",
          metadata: data.metadata ?? {}
        };
      });
    }
  } catch (error) {
    console.error("Error fetching activity logs:", error);
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent account activityxx</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <ActivityLogClient activities={activities} showFilters={showFilters} />
      </CardContent>
    </Card>
  );
}
