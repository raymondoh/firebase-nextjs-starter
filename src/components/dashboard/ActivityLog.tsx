"use server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminDb } from "@/firebase/admin";
import { convertTimestamps } from "@/actions/utils/firebase-helpers";
import { ActivityLogClient } from "./ActivityLogClient";
import type { ActivityLogProps } from "@/types/dashboard";

export async function ActivityLog({ userId, limit = 5, showFilters = true, showHeader = true }: ActivityLogProps) {
  // Fetch activity logs from Firestore
  let activities = [];

  try {
    if (userId) {
      // Updated to use the correct collection name "activityLogs"
      const activitiesSnapshot = await adminDb
        .collection("activityLogs")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(limit)
        .get();

      // Convert the data and timestamps
      const activitiesData = activitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      activities = await convertTimestamps(activitiesData);
    }
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    // Continue with empty activities if fetch fails
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent account activity</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <ActivityLogClient activities={activities} showFilters={showFilters} />
      </CardContent>
    </Card>
  );
}
