"use server";

import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { serverTimestamp } from "@/firebase/admin/firestore";
import { logActivity } from "@/firebase/actions";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import type { UpdateEmailVerificationInput, UpdateEmailVerificationResponse } from "@/types/auth/email-verification";

export async function updateEmailVerificationStatus({
  userId,
  verified
}: UpdateEmailVerificationInput): Promise<UpdateEmailVerificationResponse> {
  console.log(`[updateEmailVerificationStatus] START - userId: ${userId}, verified: ${verified}`);

  if (!userId) {
    return {
      success: false,
      error: "No user ID provided"
    };
  }

  try {
    const userRecord = await adminAuth.getUser(userId);

    if (verified && !userRecord.emailVerified) {
      console.warn(
        "[updateEmailVerificationStatus] Warning: Firestore marked email verified, but Firebase Auth is not"
      );
    }

    await adminDb.collection("users").doc(userId).update({
      emailVerified: verified,
      updatedAt: serverTimestamp()
    });

    await logActivity({
      userId,
      type: "email_verification_status_updated",
      description: `Email verification status updated to ${verified}`,
      status: "success",
      metadata: { emailVerified: verified }
    });

    console.log(`[updateEmailVerificationStatus] SUCCESS - userId: ${userId}`);
    return { success: true };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unexpected error";

    console.error("[updateEmailVerificationStatus] ERROR:", message);
    return {
      success: false,
      error: message
    };
  }
}
