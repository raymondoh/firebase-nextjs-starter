"use server";

import { auth } from "@/auth";
//import { adminDb } from "@/firebase/admin";
import { adminDb } from "@/firebase/admin";
import { processAccountDeletion } from "./deletion";
import type { ProcessDeletionsResult } from "@/types/data-privacy/deletion";

// Functions: processPendingDeletions
// Description: Process all pending deletion requests
// Returns: ProcessDeletionsResult

// For admin use: Process all pending deletion requests
export async function processPendingDeletions(): Promise<ProcessDeletionsResult> {
  const session = await auth();

  // Check if user is admin
  if (!session?.user?.role || session.user.role !== "admin") {
    throw new Error("Unauthorized. Only admins can process deletion requests.");
  }

  try {
    // Get all pending deletion requests
    const pendingRequestsSnapshot = await adminDb.collection("deletionRequests").where("status", "==", "pending").get();

    console.log(`Found ${pendingRequestsSnapshot.size} pending deletion requests`);

    let processed = 0;
    let errors = 0;

    // Process each request
    for (const doc of pendingRequestsSnapshot.docs) {
      const request = doc.data();
      try {
        const success = await processAccountDeletion(request.userId);
        if (success) {
          processed++;
        } else {
          errors++;
        }
      } catch (error) {
        console.error(`Error processing deletion for user ${request.userId}:`, error);
        errors++;
      }
    }

    return { success: true, processed, errors };
  } catch (error) {
    console.error("Error processing pending deletions:", error);
    return { success: false, processed: 0, errors: 0 };
  }
}
