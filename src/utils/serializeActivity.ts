// utils/serializeActivity.ts

import { Timestamp } from "firebase-admin/firestore";
import type { ActivityLogWithId, SerializedActivity } from "@/types/firebase/activity";

/**
 * Checks if a value is a Firestore Timestamp.
 */
function isFirestoreTimestamp(value: unknown): value is Timestamp {
  return (
    value !== null &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  );
}

/**
 * Converts an array of activity logs into a serialized form with ISO date strings.
 */
export function serializeActivityLogs(
  logs: (ActivityLogWithId & {
    name?: string;
    userEmail?: string;
  })[]
): SerializedActivity[] {
  return logs.map(log => {
    const timestamp = isFirestoreTimestamp(log.timestamp)
      ? log.timestamp.toDate().toISOString()
      : log.timestamp instanceof Date
      ? log.timestamp.toISOString()
      : typeof log.timestamp === "string"
      ? log.timestamp
      : new Date().toISOString(); // fallback

    return {
      ...log,
      timestamp,
      name: log.name ?? "",
      userEmail: log.userEmail ?? "",
      image: log.image ?? null
    };
  });
}
