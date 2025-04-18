// src/firebase/admin/activity.ts
import { adminDb } from "@/firebase/admin/firebase-admin-init";
import { Timestamp, Query, DocumentData } from "firebase-admin/firestore";
import { auth } from "@/auth";

import type {
  ActivityLogWithId,
  GetUserActivityLogsResult,
  LogActivityResult,
  ActivityLogData
} from "@/types/firebase/activity";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { getUserImage } from "@/utils/get-user-image";

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

    // 🧠 Get unique userIds and fetch user metadata
    const uniqueUserIds = [...new Set(logs.map(log => log.userId))];

    const userDataMap: Record<string, { name?: string; email?: string; image?: string }> = {};

    await Promise.all(
      uniqueUserIds.map(async userId => {
        try {
          const userDoc = await adminDb.collection("users").doc(userId).get();
          const userData = userDoc.exists ? userDoc.data() : null;

          userDataMap[userId] = {
            name: userData?.name || "",
            email: userData?.email || "",
            image: getUserImage(userData || {}) || undefined
          };
        } catch {
          userDataMap[userId] = {
            name: "",
            email: "",
            image: ""
          };
        }
      })
    );

    const activities: ActivityLogWithId[] = logs.map(log => {
      const user = userDataMap[log.userId] ?? {};
      return {
        ...log,
        name: user.name,
        userEmail: user.email,
        image: user.image
      };
    });

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

    // 🧠 Fetch the current user’s Firestore doc
    let userEmail = "";
    let userName = "";
    let image: string | null = null;

    try {
      const userDoc = await adminDb.collection("users").doc(session.user.id).get();
      const userData = userDoc.exists ? userDoc.data() : null;

      userEmail = userData?.email || "";
      userName = userData?.name || "";
      image = getUserImage(userData || {});
    } catch (error) {
      const message = isFirebaseError(error)
        ? firebaseError(error)
        : error instanceof Error
        ? error.message
        : "Unknown error";

      console.warn(`Could not fetch user metadata for ${session.user.id}: ${message}`);
    }

    const activities: ActivityLogWithId[] = logs.map(log => ({
      ...(log as ActivityLogWithId),
      name: userName,
      userEmail,
      image
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
