"use server";

import { adminAuth, adminDb } from "@/firebase/admin";
import { serverTimestamp } from "@/firebase/admin/firestore";
import { logActivity } from "@/firebase";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";

export async function updateEmailVerificationStatus(userId: string, verified: boolean) {
  console.log(`[updateEmailVerificationStatus] START - userId: ${userId}, verified: ${verified}`);

  if (!userId) {
    console.error("[updateEmailVerificationStatus] No user ID provided");
    return {
      success: false,
      error: "No user ID provided"
    };
  }

  try {
    console.log(`[updateEmailVerificationStatus] Checking user in Firebase Auth...`);

    try {
      const userRecord = await adminAuth.getUser(userId);

      if (!userRecord) {
        console.error(`[updateEmailVerificationStatus] User ${userId} not found in Firebase Auth`);
        return {
          success: false,
          error: "User not found"
        };
      }

      if (verified && !userRecord.emailVerified) {
        console.warn(
          `[updateEmailVerificationStatus] Warning: email marked as verified in Firestore, but not in Firebase Auth for user ${userId}`
        );
      }
    } catch (authError) {
      const message = isFirebaseError(authError)
        ? firebaseError(authError)
        : authError instanceof Error
        ? authError.message
        : "Unknown error in Firebase Auth";

      console.error(`[updateEmailVerificationStatus] Firebase Auth error:`, message);
      return {
        success: false,
        error: message
      };
    }

    console.log(`[updateEmailVerificationStatus] Updating Firestore document...`);

    try {
      await adminDb.collection("users").doc(userId).update({
        emailVerified: verified,
        updatedAt: serverTimestamp()
      });

      console.log(`[updateEmailVerificationStatus] Firestore update complete`);
    } catch (firestoreError) {
      const message = isFirebaseError(firestoreError)
        ? firebaseError(firestoreError)
        : firestoreError instanceof Error
        ? firestoreError.message
        : "Unknown Firestore error";

      console.error(`[updateEmailVerificationStatus] Firestore update failed:`, message);
      return {
        success: false,
        error: message
      };
    }

    console.log(`[updateEmailVerificationStatus] Logging activity...`);

    try {
      await logActivity({
        userId,
        type: "email_verification_status_updated",
        description: `Email verification status updated to ${verified}`,
        status: "success",
        metadata: { emailVerified: verified }
      });

      console.log(`[updateEmailVerificationStatus] Activity log successful`);
    } catch (activityError) {
      const message = isFirebaseError(activityError)
        ? firebaseError(activityError)
        : activityError instanceof Error
        ? activityError.message
        : "Unknown activity logging error";

      console.error(`[updateEmailVerificationStatus] Activity logging error:`, message);
    }

    console.log(`[updateEmailVerificationStatus] END - Success`);
    return { success: true };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unexpected error";

    console.error("[updateEmailVerificationStatus] Final catch block error:", message);
    return {
      success: false,
      error: message
    };
  }
}
