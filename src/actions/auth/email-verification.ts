"use server";

import { adminAuth, adminDb } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { logActivity } from "@/firebase";

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
          `[updateEmailVerificationStatus] Attempting to mark email as verified in Firestore, but it's not verified in Firebase Auth for user ${userId}`
        );
      }
    } catch (authError) {
      console.error(`[updateEmailVerificationStatus] Error checking user in Firebase Auth: ${authError}`);
      return {
        success: false,
        error: "Failed to verify user in Firebase Auth"
      };
    }

    console.log(`[updateEmailVerificationStatus] Updating user document in Firestore...`);

    try {
      await adminDb.collection("users").doc(userId).update({
        emailVerified: verified,
        updatedAt: FieldValue.serverTimestamp()
      });
      console.log(`[updateEmailVerificationStatus] Firestore updated successfully`);
    } catch (firestoreError) {
      console.error(`[updateEmailVerificationStatus] Error updating Firestore:`, firestoreError);
      return {
        success: false,
        error: "Failed to update Firestore"
      };
    }

    console.log(`[updateEmailVerificationStatus] Logging activity...`);

    try {
      await logActivity({
        userId,
        type: "email_verification_status_updated",
        description: `Email verification status updated to ${verified}`,
        status: "success",
        metadata: {
          emailVerified: verified
        }
      });
      console.log(`[updateEmailVerificationStatus] Activity logged successfully`);
    } catch (activityError) {
      console.error(`[updateEmailVerificationStatus] Error logging activity:`, activityError);
    }

    console.log(`[updateEmailVerificationStatus] END - Success`);
    return { success: true };
  } catch (error) {
    console.error("[updateEmailVerificationStatus] Error updating email verification status:", error);
    return {
      success: false,
      error: error
    };
  }
}
