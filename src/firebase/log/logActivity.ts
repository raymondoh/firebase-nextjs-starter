// src/firebase/log/logActivity.ts
import { adminDb } from "@/firebase/admin/firebase-admin-init";
import { serverTimestamp } from "@/firebase/admin/firestore";
import type { ActivityLogInput } from "@/types/dashboard/activity";

export async function logActivity(input: ActivityLogInput) {
  await adminDb.collection("activityLogs").add({
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}
