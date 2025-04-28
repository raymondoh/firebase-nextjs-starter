"use server";

// ================= Imports =================
import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { serverTimestamp } from "@/utils/date-server";
import { logActivity } from "@/firebase/actions";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { logServerEvent, logger } from "@/utils/logger";
import type { UpdateEmailVerificationInput, UpdateEmailVerificationResponse } from "@/types/auth/email-verification";

// ================= Update Email Verification Status =================

/**
 * Updates the email verification status of a user in Firestore.
 * Logs activity and server events for auditing.
 */
export async function updateEmailVerificationStatus({
  userId,
  verified
}: UpdateEmailVerificationInput): Promise<UpdateEmailVerificationResponse> {
  logger({
    type: "info",
    message: "Starting updateEmailVerificationStatus",
    metadata: { userId, verified },
    context: "auth"
  });

  if (!userId) {
    logger({
      type: "warn",
      message: "No user ID provided to updateEmailVerificationStatus",
      context: "auth"
    });
    return { success: false, error: "No user ID provided" };
  }

  try {
    // 1. Check Firebase Auth user record
    const userRecord = await adminAuth.getUser(userId);

    if (verified && !userRecord.emailVerified) {
      logger({
        type: "warn",
        message: "Firestore marked email verified, but Firebase Auth still shows unverified",
        metadata: { userId },
        context: "auth"
      });
    }

    // 2. Update Firestore user document
    await adminDb.collection("users").doc(userId).update({
      emailVerified: verified,
      updatedAt: serverTimestamp()
    });

    // 3. Log user activity
    await logActivity({
      userId,
      type: "email_verification_status_updated",
      description: `Email verification status updated to ${verified}`,
      status: "success",
      metadata: { emailVerified: verified }
    });

    // 4. Log server event
    await logServerEvent({
      type: "auth:update_email_verification",
      message: "Updated email verification status",
      userId,
      metadata: { emailVerified: verified },
      context: "auth"
    });

    logger({
      type: "info",
      message: "Successfully updated email verification status",
      metadata: { userId, verified },
      context: "auth"
    });

    return { success: true };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unexpected error updating email verification status";

    logger({
      type: "error",
      message: "Error updating email verification status",
      metadata: { error },
      context: "auth"
    });

    await logServerEvent({
      type: "auth:update_email_verification_error",
      message: "Error updating email verification status",
      userId,
      metadata: { error: message },
      context: "auth"
    });

    return { success: false, error: message };
  }
}
