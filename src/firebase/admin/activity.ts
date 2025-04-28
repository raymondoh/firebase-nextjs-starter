// src/firebase/admin/activity.ts

import { adminDb } from "@/firebase/admin/firebase-admin-init";
import { Timestamp, Query, DocumentData } from "firebase-admin/firestore";
import { auth } from "@/auth";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { getUserImage } from "@/utils/get-user-image";

import type {
  ActivityLogWithId,
  GetUserActivityLogsResult,
  LogActivityResult,
  ActivityLogData
} from "@/types/firebase/activity";

// ==================== Helpers ====================

/** Helper to fetch the current session user */
async function getSessionUser(requireAdmin = false) {
  const session = await auth();

  if (!session?.user?.id || (requireAdmin && session.user.role !== "admin")) {
    throw new Error("Unauthorized access");
  }

  return session.user;
}

/** Helper to fetch user metadata */
async function fetchUserMetadata(userId: string) {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    return {
      name: userData?.name || "",
      email: userData?.email || "",
      image: getUserImage(userData || {}) || undefined
    };
  } catch {
    return { name: "", email: "", image: undefined };
  }
}

/** Format consistent error messages */
function getErrorMessage(error: unknown): string {
  if (isFirebaseError(error)) return firebaseError(error);
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

// ==================== Get All Activity Logs (Admin Only) ====================

export async function getAllActivityLogs(
  limit = 10,
  startAfter?: string,
  type?: string
): Promise<GetUserActivityLogsResult> {
  try {
    await getSessionUser(true); // Must be admin

    const collectionRef = adminDb.collection("activityLogs");
    let query: Query<DocumentData> = collectionRef;

    if (type) query = query.where("type", "==", type);

    query = query.orderBy("timestamp", "desc");

    if (startAfter) {
      const startAfterDoc = await collectionRef.doc(startAfter).get();
      if (startAfterDoc.exists) query = query.startAfter(startAfterDoc);
    }

    const logsSnapshot = await query.limit(limit).get();
    const logs = logsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as ActivityLogData) }));

    // Fetch unique user metadata
    const uniqueUserIds = [...new Set(logs.map(log => log.userId))];
    const userDataMap = Object.fromEntries(
      await Promise.all(uniqueUserIds.map(async id => [id, await fetchUserMetadata(id)]))
    );

    const activities: ActivityLogWithId[] = logs.map(log => ({
      ...log,
      ...userDataMap[log.userId]
    }));

    console.log("[getAllActivityLogs] Logs fetched:", logs.length);
    return { success: true, activities };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Error getting all activity logs:", message);
    return { success: false, error: message };
  }
}

// ==================== Get Current User's Activity Logs ====================

export async function getUserActivityLogs(
  limit = 100,
  startAfter?: string,
  type?: string,
  description?: string
): Promise<GetUserActivityLogsResult> {
  try {
    const user = await getSessionUser();

    let query: Query<DocumentData> = adminDb.collection("activityLogs").where("userId", "==", user.id);

    if (type) query = query.where("type", "==", type);
    if (description) query = query.where("description", "==", description);

    query = query.orderBy("timestamp", "desc");

    if (startAfter) {
      const startAfterDoc = await adminDb.collection("activityLogs").doc(startAfter).get();
      if (startAfterDoc.exists) query = query.startAfter(startAfterDoc);
    }

    const logsSnapshot = await query.limit(limit).get();
    const logs = logsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as ActivityLogData) }));

    const userMetadata = await fetchUserMetadata(user.id);

    const activities: ActivityLogWithId[] = logs.map(log => ({
      ...log,
      ...userMetadata
    }));

    return { success: true, activities };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Error getting user activity logs:", message);
    return { success: false, error: message };
  }
}

// ==================== Log Activity ====================

export async function logActivity(data: Omit<ActivityLogData, "timestamp">): Promise<LogActivityResult> {
  try {
    const payload: ActivityLogData = {
      ...data,
      timestamp: Timestamp.now()
    };

    const docRef = await adminDb.collection("activityLogs").add(payload);

    return { success: true, activityId: docRef.id };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Error logging activity:", message);
    return { success: false, error: message };
  }
}
