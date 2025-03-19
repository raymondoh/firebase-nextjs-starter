"use server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/firebase/admin";
import { logActivity } from "@/firebase";
import bcryptjs from "bcryptjs";

/**
 * Logs a password reset activity
 * This is called from the client after sending a password reset email
 */
export async function logPasswordResetActivity(email: string) {
  if (!email) {
    return {
      success: false,
      error: "Email is required"
    };
  }

  try {
    console.log(`[PASSWORD_RESET] Logging password reset activity for: ${email}`);

    // Try to get the user ID from Firebase Auth
    try {
      const userRecord = await adminAuth.getUserByEmail(email);

      if (userRecord) {
        console.log(`[PASSWORD_RESET] Found user record for email:`, userRecord.uid);

        // Log the activity
        await logActivity({
          userId: userRecord.uid,
          type: "password_reset_requested",
          description: "Password reset email sent",
          status: "success",
          metadata: {
            email
          }
        });

        console.log(`[PASSWORD_RESET] Activity logged successfully`);
      }
    } catch (error: any) {
      // If user not found, just log a message but don't throw an error
      if (error.code === "auth/user-not-found") {
        console.log(`[PASSWORD_RESET] User not found for email: ${email}, skipping activity logging`);
      } else {
        console.error("[PASSWORD_RESET] Error logging password reset activity:", error);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("[PASSWORD_RESET] Error in logPasswordResetActivity:", error);
    // Return success anyway to not expose errors to the client
    return { success: true };
  }
}

/**
 * Gets a user ID by email
 * This is used when resetting a password to update the Firestore hash
 */
export async function getUserIdByEmail(email: string) {
  if (!email) {
    return {
      success: false,
      error: "Email is required"
    };
  }

  try {
    console.log(`[PASSWORD_RESET] Getting user ID for email: ${email}`);

    const userRecord = await adminAuth.getUserByEmail(email);

    console.log(`[PASSWORD_RESET] Found user ID: ${userRecord.uid}`);

    return {
      success: true,
      userId: userRecord.uid
    };
  } catch (error: any) {
    console.error("[PASSWORD_RESET] Error getting user ID by email:", error);

    if (error.code === "auth/user-not-found") {
      return {
        success: false,
        error: "User not found"
      };
    }

    return {
      success: false,
      error: "Failed to get user ID"
    };
  }
}

/**
 * Updates the password hash in Firestore
 * This is called when a user resets their password
 */
export async function updatePasswordHash(userId: string, newPassword: string) {
  if (!userId || !newPassword) {
    return {
      success: false,
      error: "User ID and new password are required"
    };
  }

  try {
    console.log(`[PASSWORD_RESET] Updating password hash for user: ${userId}`);

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(newPassword, salt);

    // Update the user document in Firestore
    await adminDb.collection("users").doc(userId).update({
      passwordHash,
      updatedAt: FieldValue.serverTimestamp()
    });

    // Log the activity
    await logActivity({
      userId,
      type: "password_reset_completed",
      description: "Password reset completed",
      status: "success"
    });

    console.log(`[PASSWORD_RESET] Password hash updated successfully for user: ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("[PASSWORD_RESET] Error updating password hash:", error);
    return {
      success: false,
      error: "Failed to update password hash"
    };
  }
}
