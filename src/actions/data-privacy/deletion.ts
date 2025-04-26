// // src/actions/data-privacy/deletion.ts
// "use server";

// import { auth, signOut } from "@/auth";
// import { adminAuth, adminDb, adminStorage } from "@/firebase/admin/firebase-admin-init";
// // Updated import for serverTimestamp from the new date helper:
// import { serverTimestamp } from "@/utils/date-server";
// import { cookies } from "next/headers";
// import { accountDeletionSchema } from "@/schemas/data-privacy";
// import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
// import { logActivity } from "@/firebase/actions";
// import type { DeleteAccountState } from "@/types/data-privacy/deletion";
// import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

// /**
//  * Process an account deletion request
//  */
// export async function processAccountDeletion(userId: string): Promise<boolean> {
//   try {
//     // Delete Firestore user document
//     await adminDb.collection("users").doc(userId).delete();

//     // Delete Firebase Auth user
//     await adminAuth.deleteUser(userId);

//     // Delete profile image from Firebase Storage
//     const storageRef = adminStorage.bucket().file(`users/${userId}/profile.jpg`);
//     try {
//       await storageRef.delete();
//     } catch (error: unknown) {
//       if (typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 404) {
//         console.log("File not found in storage, skipping deletion.");
//       } else {
//         console.error("Storage deletion error:", error);
//       }
//     }

//     // Mark deletion as completed
//     await adminDb.collection("deletionRequests").doc(userId).update({
//       status: "completed",
//       completedAt: serverTimestamp()
//     });

//     await logActivity({
//       userId,
//       type: "deletion_completed",
//       description: "Account deletion completed",
//       status: "completed"
//     });

//     console.log(`✅ Account deleted successfully for user ${userId}`);
//     return true;
//   } catch (error: unknown) {
//     console.error("❌ Error processing account deletion:", error);

//     await adminDb.collection("deletionRequests").doc(userId).update({
//       status: "failed",
//       completedAt: serverTimestamp()
//     });

//     await logActivity({
//       userId,
//       type: "deletion_failed",
//       description: "Account deletion failed",
//       status: "failed"
//     });

//     return false;
//   }
// }

// /**
//  * Create a pending deletion request (or delete immediately)
//  */
// export async function requestAccountDeletion(
//   prevState: DeleteAccountState | null,
//   formData: FormData
// ): Promise<DeleteAccountState> {
//   const session = await auth();

//   if (!session?.user?.id) {
//     return { success: false, error: "Not authenticated" };
//   }

//   try {
//     const immediateDelete = formData.get("immediateDelete") === "true";
//     const validated = accountDeletionSchema.parse({ immediateDelete });

//     await adminDb.collection("deletionRequests").doc(session.user.id).set({
//       userId: session.user.id,
//       email: session.user.email,
//       requestedAt: serverTimestamp(),
//       status: "pending",
//       completedAt: null
//     });

//     await logActivity({
//       userId: session.user.id,
//       type: "deletion_request",
//       description: "Account deletion requested",
//       status: "pending"
//     });

//     if (validated.immediateDelete) {
//       await processAccountDeletion(session.user.id);
//       await signOut({ redirect: false });

//       // Clear all cookies after sign out
//       const cookieStore = await cookies();
//       const allCookies = cookieStore.getAll();
//       allCookies.forEach((cookie: RequestCookie) => {
//         cookieStore.set(cookie.name, "", { maxAge: 0 });
//       });

//       return {
//         success: true,
//         message: "Your account has been deleted. You will be redirected to the homepage.",
//         shouldRedirect: true
//       };
//     }

//     return {
//       success: true,
//       message: "Your account deletion request has been submitted. You will receive an email confirmation shortly."
//     };
//   } catch (error: unknown) {
//     const message = isFirebaseError(error)
//       ? firebaseError(error)
//       : error instanceof Error
//       ? error.message
//       : "Failed to request account deletion";

//     console.error("❌ Error requesting deletion:", error);

//     return { success: false, error: message };
//   }
// }
"use server";

import { auth, signOut } from "@/auth";
import { adminAuth, adminDb, adminStorage } from "@/firebase/admin/firebase-admin-init";
import { serverTimestamp } from "@/utils/date-server";
import { cookies } from "next/headers";
import { accountDeletionSchema } from "@/schemas/data-privacy";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { logActivity } from "@/firebase/actions";
import { logServerEvent, logger } from "@/utils/logger";
import type { DeleteAccountState } from "@/types/data-privacy/deletion";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

/**
 * Process an account deletion request
 */
export async function processAccountDeletion(userId: string): Promise<boolean> {
  try {
    // Delete Firestore user document
    await adminDb.collection("users").doc(userId).delete();
    logger({ type: "info", message: `Deleted Firestore user document for ${userId}`, context: "deletion" });

    // Delete Firebase Auth user
    await adminAuth.deleteUser(userId);
    logger({ type: "info", message: `Deleted Firebase Auth user ${userId}`, context: "deletion" });

    // Delete profile image from Firebase Storage
    const storageRef = adminStorage.bucket().file(`users/${userId}/profile.jpg`);
    try {
      await storageRef.delete();
      logger({ type: "info", message: `Deleted profile image for ${userId}`, context: "deletion" });
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 404) {
        logger({ type: "warn", message: `Profile image not found for ${userId}`, context: "deletion" });
      } else {
        logger({
          type: "error",
          message: `Storage deletion error for ${userId}`,
          metadata: { error },
          context: "deletion"
        });
      }
    }

    // Mark deletion as completed
    await adminDb.collection("deletionRequests").doc(userId).update({
      status: "completed",
      completedAt: serverTimestamp()
    });

    await logActivity({
      userId,
      type: "deletion_completed",
      description: "Account deletion completed",
      status: "completed"
    });

    await logServerEvent({
      type: "deletion:completed",
      message: `Account deletion completed for userId: ${userId}`,
      userId,
      context: "deletion"
    });

    return true;
  } catch (error: unknown) {
    logger({
      type: "error",
      message: `Error processing account deletion for userId: ${userId}`,
      metadata: { error },
      context: "deletion"
    });

    await adminDb.collection("deletionRequests").doc(userId).update({
      status: "failed",
      completedAt: serverTimestamp()
    });

    await logActivity({
      userId,
      type: "deletion_failed",
      description: "Account deletion failed",
      status: "failed"
    });

    await logServerEvent({
      type: "deletion:failed",
      message: `Account deletion failed for userId: ${userId}`,
      userId,
      metadata: { error },
      context: "deletion"
    });

    return false;
  }
}

/**
 * Create a pending deletion request (or delete immediately)
 */
export async function requestAccountDeletion(
  prevState: DeleteAccountState | null,
  formData: FormData
): Promise<DeleteAccountState> {
  const session = await auth();

  if (!session?.user?.id) {
    logger({ type: "warn", message: "Unauthorized requestAccountDeletion attempt", context: "deletion" });
    return { success: false, error: "Not authenticated" };
  }

  try {
    const immediateDelete = formData.get("immediateDelete") === "true";
    const validated = accountDeletionSchema.parse({ immediateDelete });

    await adminDb.collection("deletionRequests").doc(session.user.id).set({
      userId: session.user.id,
      email: session.user.email,
      requestedAt: serverTimestamp(),
      status: "pending",
      completedAt: null
    });

    await logActivity({
      userId: session.user.id,
      type: "deletion_request",
      description: "Account deletion requested",
      status: "pending"
    });

    logger({
      type: "info",
      message: `Deletion request submitted for userId: ${session.user.id}`,
      context: "deletion"
    });

    if (validated.immediateDelete) {
      await processAccountDeletion(session.user.id);
      await signOut({ redirect: false });

      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      allCookies.forEach((cookie: RequestCookie) => {
        cookieStore.set(cookie.name, "", { maxAge: 0 });
      });

      logger({
        type: "info",
        message: `Immediate account deletion completed for ${session.user.id}`,
        context: "deletion"
      });

      return {
        success: true,
        message: "Your account has been deleted. You will be redirected to the homepage.",
        shouldRedirect: true
      };
    }

    return {
      success: true,
      message: "Your account deletion request has been submitted. You will receive an email confirmation shortly."
    };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Failed to request account deletion";

    logger({
      type: "error",
      message: "Error during requestAccountDeletion",
      metadata: { error },
      context: "deletion"
    });

    return { success: false, error: message };
  }
}
