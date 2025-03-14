// actions/utils/firebase-helpers.ts
"use server";

import { Timestamp } from "firebase-admin/firestore";

// Helper function to convert Firestore Timestamp to ISO string
export async function convertTimestamps(obj: any): any {
  if (obj instanceof Timestamp) {
    return obj.toDate().toISOString();
  } else if (Array.isArray(obj)) {
    return obj.map(convertTimestamps);
  } else if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, convertTimestamps(value)]));
  }
  return obj;
}
