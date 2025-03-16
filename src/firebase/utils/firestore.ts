// src/firebase/utils/firestore.ts
import { Timestamp as AdminTimestamp } from "firebase-admin/firestore";
import { Timestamp as ClientTimestamp } from "firebase/firestore";

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
