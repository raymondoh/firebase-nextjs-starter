// src/firebase/admin/activity.ts
import { adminAuth, adminDb } from "@/firebase/admin";
import { Timestamp, Query, DocumentData } from "firebase-admin/firestore";
import { auth } from "@/auth";

import type {
  ActivityLogWithId,
  GetUserActivityLogsResult,
  LogActivityResult,
  ActivityLogData
} from "@/types/firebase/activity";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";

export async function getAllActivityLogs(
  limit = 10,
  startAfter?: string,
  type?: string
): Promise<GetUserActivityLogsResult> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    const collectionRef = adminDb.collection("activityLogs");
    let query: Query<DocumentData> = collectionRef;

    if (type) {
      query = query.where("type", "==", type);
    }

    query = query.orderBy("timestamp", "desc");

    if (startAfter) {
      const startAfterDoc = await collectionRef.doc(startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    query = query.limit(limit);

    const logsSnapshot = await query.get();
    const logs = logsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as ActivityLogData) }));

    // 🧠 Batch fetch unique user emails
    const uniqueUserIds = [...new Set(logs.map(log => log.userId))];
    const userEmailsMap: Record<string, string> = {};

    await Promise.all(
      uniqueUserIds.map(async userId => {
        try {
          const userRecord = await adminAuth.getUser(userId);
          userEmailsMap[userId] = userRecord.email || "";
        } catch {
          userEmailsMap[userId] = "";
        }
      })
    );

    const activities: ActivityLogWithId[] = logs.map(log => ({
      ...(log as ActivityLogWithId),
      userEmail: userEmailsMap[log.userId] ?? ""
    }));
    console.log("[getAllActivityLogs] Logs fetched:", logs.length);

    return { success: true, activities };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error";

    console.error("Error getting all activity logs:", message);
    return { success: false, error: message };
  }
}
export async function getUserActivityLogs(
  limit = 100,
  startAfter?: string,
  type?: string,
  description?: string
): Promise<GetUserActivityLogsResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const collectionRef = adminDb.collection("activityLogs");
    let query: Query<DocumentData> = collectionRef.where("userId", "==", session.user.id);

    if (type) {
      query = query.where("type", "==", type);
    }

    if (description) {
      query = query.where("description", "==", description);
    }

    query = query.orderBy("timestamp", "desc");

    if (startAfter) {
      const startAfterDoc = await collectionRef.doc(startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    query = query.limit(limit);

    const logsSnapshot = await query.get();
    const logs = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // ✅ Single user = single fetch
    let userEmail = "";
    try {
      const userRecord = await adminAuth.getUser(session.user.id);
      userEmail = userRecord.email || "";
    } catch (error) {
      console.warn(`Could not fetch user email for ${session.user.id}`);
    }

    const activities: ActivityLogWithId[] = logs.map(log => ({
      ...(log as ActivityLogWithId),
      userEmail
    }));

    return { success: true, activities };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error";

    console.error("Error getting user activity logs:", message);
    return { success: false, error: message };
  }
}
//**Purpose**: Creates a new activity log entry in the database.
export async function logActivity(data: Omit<ActivityLogData, "timestamp">): Promise<LogActivityResult> {
  try {
    const payload: ActivityLogData = {
      ...data,
      timestamp: Timestamp.now()
    };

    const docRef = await adminDb.collection("activityLogs").add(payload);

    return { success: true, activityId: docRef.id };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error logging activity";

    console.error("🔥 Error logging activity:", message); // optional: helpful log
    return { success: false, error: message };
  }
}
