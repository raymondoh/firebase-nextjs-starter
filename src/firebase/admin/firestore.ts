// firebase/admin/firestore.ts
import "server-only"; // Add this to prevent client imports

import { adminDb } from "./firebase-admin-init";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

//
export const serverTimestamp = () => FieldValue.serverTimestamp();
export const increment = (value: number) => FieldValue.increment(value);

/**
 * Convert a JavaScript Date to a Firestore Timestamp
 * @param date - The date to convert
 */
export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

/**
 * Convert a Firestore Timestamp to a JavaScript Date
 * @param timestamp - The timestamp to convert
 */
export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

/**
 * Convert a Firestore Timestamp to an ISO string
 * @param timestamp - The timestamp to convert
 */
export function timestampToISOString(timestamp: Timestamp): string {
  return timestamp.toDate().toISOString();
}

/**
 * Create a batch for multiple operations
 */
export function createBatch() {
  return adminDb.batch();
}

/**
 * Get a document reference
 * @param collection - The collection name
 * @param docId - The document ID
 */
export function getDocRef(collection: string, docId: string) {
  return adminDb.collection(collection).doc(docId);
}

/**
 * Get a collection reference
 * @param collection - The collection name
 */
export function getCollectionRef(collection: string) {
  return adminDb.collection(collection);
}
