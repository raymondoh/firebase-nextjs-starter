"use server";

import { adminAuth, adminDb } from "@/firebase/admin";
import { serverTimestamp } from "@/firebase/admin/firestore";
import { logActivity } from "@/firebase";
import bcryptjs from "bcryptjs";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";

/**
 * Logs a password reset activity
 */
export async function logPasswordResetActivity(email: string) {
  if (!email) {
    return { success: false, error: "Email is required" };
  }

  try {
    console.log(`[PASSWORD_RESET] Logging password reset activity for: ${email}`);

    try {
      const userRecord = await adminAuth.getUserByEmail(email);

      if (userRecord) {
        console.log(`[PASSWORD_RESET] Found user record: ${userRecord.uid}`);

        await logActivity({
          userId: userRecord.uid,
          type: "password_reset_requested",
          description: "Password reset email sent",
          status: "success",
          metadata: { email }
        });

        console.log(`[PASSWORD_RESET] Activity logged successfully`);
      }
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "auth/user-not-found"
      ) {
        console.log(`[PASSWORD_RESET] User not found for email: ${email} — skipping logging`);
      } else {
        console.error("[PASSWORD_RESET] Error logging activity:", error);
      }
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("[PASSWORD_RESET] General error:", error);
    return { success: true }; // Do not reveal failure to attacker
  }
}

/**
 * Gets a user ID by email
 */
export async function getUserIdByEmail(email: string) {
  if (!email) {
    return { success: false, error: "Email is required" };
  }

  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    return { success: true, userId: userRecord.uid };
  } catch (error: unknown) {
    console.error("[PASSWORD_RESET] Error getting user ID:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "auth/user-not-found"
    ) {
      return { success: false, error: "User not found" };
    }

    if (isFirebaseError(error)) {
      return { success: false, error: firebaseError(error) };
    }

    return { success: false, error: "Failed to get user ID" };
  }
}

/**
 * Updates password hash in Firestore
 */
export async function updatePasswordHash(userId: string, newPassword: string) {
  if (!userId || !newPassword) {
    return { success: false, error: "User ID and new password are required" };
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(newPassword, salt);

    await adminDb.collection("users").doc(userId).update({
      passwordHash,
      updatedAt: serverTimestamp()
    });

    await logActivity({
      userId,
      type: "password_reset_completed",
      description: "Password reset completed",
      status: "success"
    });

    console.log(`[PASSWORD_RESET] Password hash updated for user: ${userId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("[PASSWORD_RESET] Error updating hash:", error);

    if (isFirebaseError(error)) {
      return { success: false, error: firebaseError(error) };
    }

    return { success: false, error: "Failed to update password hash" };
  }
}
