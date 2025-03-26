"use server";

import { auth } from "@/auth";
import { adminDb } from "@/firebase/admin";
import { processAccountDeletion } from "./deletion";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import type { ProcessDeletionsResult } from "@/types/data-privacy/deletion";

// Admin-only: Process all pending deletion requests
export async function processPendingDeletions(): Promise<ProcessDeletionsResult> {
  const session = await auth();

  // Authorization check
  if (!session?.user?.role || session.user.role !== "admin") {
    return {
      success: false,
      processed: 0,
      errors: 0,
      error: "Unauthorized. Only admins can process deletion requests."
    };
  }

  try {
    const pendingRequestsSnapshot = await adminDb.collection("deletionRequests").where("status", "==", "pending").get();

    console.log(`Found ${pendingRequestsSnapshot.size} pending deletion requests`);

    let processed = 0;
    let errors = 0;

    for (const doc of pendingRequestsSnapshot.docs) {
      const request = doc.data();
      const userId = request.userId;

      if (!userId) {
        console.warn(`Skipping deletion request with missing userId in doc ${doc.id}`);
        errors++;
        continue;
      }

      try {
        const success = await processAccountDeletion(userId);
        if (success) {
          processed++;
        } else {
          errors++;
        }
      } catch (err: unknown) {
        console.error(`Error processing deletion for user ${userId}:`, err);

        if (isFirebaseError(err)) {
          console.error(firebaseError(err));
        }

        errors++;
      }
    }

    return { success: true, processed, errors };
  } catch (error: unknown) {
    console.error("Error processing pending deletions:", error);

    const errorMessage = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : String(error);

    return {
      success: false,
      processed: 0,
      errors: 0,
      error: errorMessage
    };
  }
}
