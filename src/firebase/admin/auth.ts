// src/firebase/admin/auth.ts
import { adminAuth } from "@/firebase/admin";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";

/**
 * Server-safe function to check if a Firebase user's email is verified.
 */
export async function isEmailVerified(
  userId: string
): Promise<{ success: boolean; verified?: boolean; error?: string }> {
  try {
    const userRecord = await adminAuth.getUser(userId);

    return { success: true, verified: userRecord.emailVerified };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error checking email verification status";

    return { success: false, error: message };
  }
}
