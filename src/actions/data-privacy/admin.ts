"use server";

import { auth } from "@/auth";
import { adminDb } from "@/firebase/admin/firebase-admin-init";
import { processAccountDeletion } from "./deletion";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { serverTimestamp } from "@/firebase/admin/firestore";
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

    if (pendingRequestsSnapshot.empty) {
      console.log("No pending deletion requests found.");
      return { success: true, processed: 0, errors: 0 };
    }

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

          // ✅ Mark the request as processed with timestamp
          await adminDb.collection("deletionRequests").doc(doc.id).update({
            status: "processed",
            processedAt: serverTimestamp()
          });
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
