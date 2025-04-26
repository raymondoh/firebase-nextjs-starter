// //src/actions/data-privacy/admin.ts
// "use server";

// import { auth } from "@/auth";
// import { adminDb } from "@/firebase/admin/firebase-admin-init";
// import { processAccountDeletion } from "./deletion";
// import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
// // Updated import: now pulling serverTimestamp from the new date helper:
// import { serverTimestamp } from "@/utils/date-server";
// import type { ProcessDeletionsResult } from "@/types/data-privacy/deletion";

// // Admin-only: Process all pending deletion requests
// export async function processPendingDeletions(): Promise<ProcessDeletionsResult> {
//   const session = await auth();

//   // Authorization check
//   if (!session?.user?.role || session.user.role !== "admin") {
//     return {
//       success: false,
//       processed: 0,
//       errors: 0,
//       error: "Unauthorized. Only admins can process deletion requests."
//     };
//   }

//   try {
//     const pendingRequestsSnapshot = await adminDb.collection("deletionRequests").where("status", "==", "pending").get();

//     if (pendingRequestsSnapshot.empty) {
//       console.log("No pending deletion requests found.");
//       return { success: true, processed: 0, errors: 0 };
//     }

//     console.log(`Found ${pendingRequestsSnapshot.size} pending deletion requests`);

//     let processed = 0;
//     let errors = 0;

//     for (const doc of pendingRequestsSnapshot.docs) {
//       const request = doc.data();
//       const userId = request.userId;

//       if (!userId) {
//         console.warn(`Skipping deletion request with missing userId in doc ${doc.id}`);
//         errors++;
//         continue;
//       }

//       try {
//         const success = await processAccountDeletion(userId);
//         if (success) {
//           processed++;

//           // ✅ Mark the request as processed with timestamp
//           await adminDb.collection("deletionRequests").doc(doc.id).update({
//             status: "processed",
//             processedAt: serverTimestamp()
//           });
//         } else {
//           errors++;
//         }
//       } catch (err: unknown) {
//         console.error(`Error processing deletion for user ${userId}:`, err);

//         if (isFirebaseError(err)) {
//           console.error(firebaseError(err));
//         }

//         errors++;
//       }
//     }

//     return { success: true, processed, errors };
//   } catch (error: unknown) {
//     console.error("Error processing pending deletions:", error);

//     const errorMessage = isFirebaseError(error)
//       ? firebaseError(error)
//       : error instanceof Error
//       ? error.message
//       : String(error);

//     return {
//       success: false,
//       processed: 0,
//       errors: 0,
//       error: errorMessage
//     };
//   }
// }
"use server";

import { auth } from "@/auth";
import { adminDb } from "@/firebase/admin/firebase-admin-init";
import { processAccountDeletion } from "./deletion";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { logServerEvent, logger } from "@/utils/logger";
import { serverTimestamp } from "@/utils/date-server";
import type { ProcessDeletionsResult } from "@/types/data-privacy/deletion";

// Admin-only: Process all pending deletion requests
export async function processPendingDeletions(): Promise<ProcessDeletionsResult> {
  const session = await auth();

  // Authorization check
  if (!session?.user?.role || session.user.role !== "admin") {
    logger({
      type: "warn",
      message: "Unauthorized attempt to process pending deletions",
      context: "deletion"
    });
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
      logger({
        type: "info",
        message: "No pending deletion requests found",
        context: "deletion"
      });
      return { success: true, processed: 0, errors: 0 };
    }

    logger({
      type: "info",
      message: `Found ${pendingRequestsSnapshot.size} pending deletion requests`,
      context: "deletion"
    });

    let processed = 0;
    let errors = 0;

    for (const doc of pendingRequestsSnapshot.docs) {
      const request = doc.data();
      const userId = request.userId;

      if (!userId) {
        logger({
          type: "warn",
          message: `Skipping deletion request with missing userId in doc ${doc.id}`,
          context: "deletion"
        });
        errors++;
        continue;
      }

      try {
        const success = await processAccountDeletion(userId);
        if (success) {
          processed++;

          await adminDb.collection("deletionRequests").doc(doc.id).update({
            status: "processed",
            processedAt: serverTimestamp()
          });

          logger({
            type: "info",
            message: `Successfully processed deletion for userId: ${userId}`,
            context: "deletion"
          });

          await logServerEvent({
            type: "deletion:processed",
            message: `Processed account deletion for userId: ${userId}`,
            userId,
            context: "deletion"
          });
        } else {
          logger({
            type: "warn",
            message: `Failed to process account deletion for userId: ${userId}`,
            context: "deletion"
          });
          errors++;
        }
      } catch (err: unknown) {
        logger({
          type: "error",
          message: `Error processing account deletion for userId: ${userId}`,
          metadata: { error: err },
          context: "deletion"
        });

        if (isFirebaseError(err)) {
          logger({
            type: "error",
            message: firebaseError(err),
            context: "deletion"
          });
        }

        errors++;
      }
    }

    return { success: true, processed, errors };
  } catch (error: unknown) {
    logger({
      type: "error",
      message: "Error processing pending deletions",
      metadata: { error },
      context: "deletion"
    });

    const errorMessage = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : String(error);

    await logServerEvent({
      type: "deletion:processing_error",
      message: "Error processing pending deletion requests",
      metadata: { error: errorMessage },
      context: "deletion"
    });

    return {
      success: false,
      processed: 0,
      errors: 0,
      error: errorMessage
    };
  }
}
