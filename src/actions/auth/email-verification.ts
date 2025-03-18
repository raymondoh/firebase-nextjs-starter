"use server";

import * as admin from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore"; // Import directly!
import { logActivity } from "@/firebase";

/**
 * Updates the emailVerified field in the Firestore users collection
 */
export async function updateEmailVerificationStatus(userId: string, verified: boolean) {
  if (!userId) {
    console.error("No user ID provided for email verification status update");
    return {
      success: false,
      error: "No user ID provided"
    };
  }

  try {
    console.log(`Updating emailVerified status for user ${userId} to ${verified}`);

    // First, verify the user exists in Firebase Auth
    try {
      const userRecord = await admin.adminAuth.getUser(userId);

      // If the user doesn't exist in Auth, don't proceed
      if (!userRecord) {
        console.error(`User ${userId} not found in Firebase Auth`);
        return {
          success: false,
          error: "User not found"
        };
      }

      // Check if the user's email is actually verified in Firebase Auth
      if (verified && !userRecord.emailVerified) {
        console.warn(
          `Attempting to mark email as verified in Firestore, but it's not verified in Firebase Auth for user ${userId}`
        );
        // We'll still proceed, but log the warning
      }
    } catch (authError) {
      console.error(`Error checking user in Firebase Auth: ${authError}`);
      return {
        success: false,
        error: "Failed to verify user in Firebase Auth"
      };
    }

    // Update the user document in Firestore
    await admin.adminDb.collection("users").doc(userId).update({
      emailVerified: verified,
      updatedAt: FieldValue.serverTimestamp()
    });

    // Log the activity
    await logActivity({
      userId,
      type: "email_verification_status_updated",
      description: `Email verification status updated to ${verified}`,
      status: "success",
      metadata: {
        emailVerified: verified
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating email verification status:", error);
    return {
      success: false,
      error: "Failed to update email verification status"
    };
  }
}
