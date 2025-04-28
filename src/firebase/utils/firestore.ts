// src/firebase/utils/firestore.ts

import { Timestamp as AdminTimestamp } from "firebase-admin/firestore";
import { Timestamp as ClientTimestamp } from "firebase/firestore";

// ================= Admin Timestamp Helpers =================

/**
 * Convert a Date to a Firestore Timestamp (admin)
 */
export function adminDateToTimestamp(date: Date): AdminTimestamp {
  return AdminTimestamp.fromDate(date);
}

/**
 * Convert a Firestore Timestamp to a Date (admin)
 */
export function adminTimestampToDate(timestamp: AdminTimestamp): Date {
  return timestamp.toDate();
}

// ================= Client Timestamp Helpers =================

/**
 * Convert a Date to a Firestore Timestamp (client)
 */
export function clientDateToTimestamp(date: Date): ClientTimestamp {
  return ClientTimestamp.fromDate(date);
}

/**
 * Convert a Firestore Timestamp to a Date (client)
 */
export function clientTimestampToDate(timestamp: ClientTimestamp): Date {
  return timestamp.toDate();
}

// ================= General Helpers =================

/**
 * Recursively converts Firestore Timestamp objects to ISO strings
 */
export function convertTimestamps(obj: unknown): unknown {
  if (typeof obj === "object" && obj !== null && "toDate" in obj && typeof (obj as any).toDate === "function") {
    return (obj as { toDate: () => Date }).toDate().toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertTimestamps);
  }

  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [key, convertTimestamps(value)])
    );
  }

  return obj;
}
