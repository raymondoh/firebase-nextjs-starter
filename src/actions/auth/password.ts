//src/actions/auth/password.ts
"use server";

import bcryptjs from "bcryptjs";
import { auth } from "@/auth";
import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { serverTimestamp } from "@/firebase/admin/firestore";
import { logActivity } from "@/firebase/actions";
import { forgotPasswordSchema, updatePasswordSchema } from "@/schemas/auth";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import type { ForgotPasswordState, UpdatePasswordState } from "@/types/auth/password";
import type { UserData } from "@/types/user";
import { logPasswordResetActivity } from "./reset-password";
import { hashPassword } from "@/utils/hashPassword";

/**
 * Helper to safely extract a string value from FormData
 */
function getFormValue(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/**
 * REQUEST PASSWORD RESET
 */

export async function requestPasswordReset(
  prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = getFormValue(formData, "email");
  if (!email) return { success: false, error: "Email is required" };

  const result = forgotPasswordSchema.safeParse({ email });
  if (!result.success) return { success: false, error: "Invalid email format" };

  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;
    const actionCodeSettings = { url: resetUrl };

    await adminAuth.generatePasswordResetLink(email, actionCodeSettings);

    // ✅ Log the reset request activity (non-blocking)
    try {
      await logPasswordResetActivity({ email });
    } catch (logError) {
      console.warn("Warning: Failed to log password reset activity:", logError);
    }

    return { success: true };
  } catch (error: unknown) {
    if (isFirebaseError(error) && error.code === "auth/user-not-found") {
      return { success: true }; // 🔒 Don't reveal user existence
    }

    return {
      success: false,
      error: isFirebaseError(error) ? firebaseError(error) : "Failed to send password reset email"
    };
  }
}

/**
 * SYNC PASSWORD WITH FIRESTORE (used after reset to update local hash)
 */
export async function syncPasswordWithFirestore(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userRecord = await adminAuth.getUserByEmail(email);

    const hashedPassword = await hashPassword(password); // ✅ use utility instead of inline bcrypt logic

    await adminDb.collection("users").doc(userRecord.uid).update({
      passwordHash: hashedPassword,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: isFirebaseError(error) ? firebaseError(error) : "Failed to sync password"
    };
  }
}

/**
 * UPDATE PASSWORD FOR LOGGED-IN USER
 */

export async function updatePassword(prevState: UpdatePasswordState, formData: FormData): Promise<UpdatePasswordState> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const currentPassword = getFormValue(formData, "currentPassword");
  const newPassword = getFormValue(formData, "newPassword");
  const confirmPassword = getFormValue(formData, "confirmPassword");

  if (!currentPassword) return { success: false, error: "Current password is required" };
  if (!newPassword) return { success: false, error: "New password is required" };
  if (!confirmPassword) return { success: false, error: "Confirm password is required" };

  const result = updatePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword });
  if (!result.success) {
    const errorMessage = result.error.issues[0]?.message || "Invalid form data";
    return { success: false, error: errorMessage };
  }

  try {
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.exists ? (userDoc.data() as UserData | undefined) : undefined;

    if (!userData?.passwordHash) {
      return { success: false, error: "User data not found or password not set" };
    }

    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, userData.passwordHash);
    if (!isCurrentPasswordValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    const newPasswordHash = await hashPassword(newPassword); // ✅ use utility instead of inline hash

    await adminAuth.updateUser(session.user.id, { password: newPassword });

    await adminDb.collection("users").doc(session.user.id).update({
      passwordHash: newPasswordHash,
      updatedAt: serverTimestamp()
    });

    await logActivity({
      userId: session.user.id,
      type: "password_change",
      description: "Password changed successfully",
      status: "success"
    });

    return { success: true };
  } catch (error: unknown) {
    if (isFirebaseError(error) && error.code === "auth/weak-password") {
      return {
        success: false,
        error: "The password is too weak. Please choose a stronger password."
      };
    }

    return {
      success: false,
      error: isFirebaseError(error) ? firebaseError(error) : "Failed to update password. Please try again."
    };
  }
}
