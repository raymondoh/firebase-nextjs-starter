// /auth/password.ts
"use server";

import bcryptjs from "bcryptjs";
import { auth } from "@/auth";
import { auth as clientAuth } from "@/firebase/client";
import {
  sendPasswordResetEmail,
  verifyPasswordResetCode as verifyResetCode,
  confirmPasswordReset as confirmReset
} from "firebase/auth";
import { adminAuth, adminDb } from "@/firebase/admin";
import { logActivity } from "@/firebase/utils/activity";
import { forgotPasswordSchema, resetPasswordSchema, updatePasswordSchema } from "@/schemas/auth";
import type { ForgotPasswordState, ResetPasswordState, UpdatePasswordState } from "@/types/auth/password";

// Functions: requestPasswordReset, resetPassword, updatePassword
// These functions are used to handle password-related actions such as requesting a password reset,
// resetting the password after clicking the email link, and updating the password for logged-in users.

// Helper function to sync password between Firebase Auth and Firestore
export async function syncPasswordAfterReset(email: string, password: string): Promise<boolean> {
  try {
    // First, try to authenticate with Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(email);

    // Get user data from Firestore
    const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
    const userData = userDoc.data();

    if (!userData || !userData.passwordHash) {
      console.error("No user data or password hash found for user:", userRecord.uid);
      return false;
    }

    // Verify the password using bcrypt before syncing
    const isPasswordValid = await bcryptjs.compare(password, userData.passwordHash);

    if (!isPasswordValid) {
      console.error("Password verification failed during sync for user:", userRecord.uid);
      return false;
    }

    // If password is valid, we don't need to update anything
    console.log("Password verified successfully during sync");
    return true;
  } catch (error) {
    console.error("Error syncing password after reset:", error);
    return false;
  }
}

// FORGOT PASSWORD (Request Reset)
export async function requestPasswordReset(
  prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  console.log("requestPasswordReset called with formData:", formData ? "exists" : "null");

  // Check if formData is null or undefined
  if (!formData) {
    console.error("FormData is null or undefined");
    return { success: false, error: "Invalid form submission" };
  }

  const email = formData.get("email");
  console.log("Email extracted from formData:", email);

  // Check if email is present and is a string
  if (!email || typeof email !== "string") {
    console.error("Email is missing from form data or is not a string");
    return { success: false, error: "Email is required" };
  }

  const result = forgotPasswordSchema.safeParse({
    email
  });

  if (!result.success) {
    console.error("Invalid email format:", result.error);
    return { success: false, error: "Invalid email format" };
  }

  try {
    console.log("Attempting to send password reset email for:", email);

    // Use Firebase client SDK to send the password reset email
    await sendPasswordResetEmail(clientAuth, email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      handleCodeInApp: true
    });

    console.log("Password reset email sent successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Password reset error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    if (error.code === "auth/user-not-found") {
      // For security reasons, we don't want to reveal if the email exists or not
      return { success: true }; // Pretend it succeeded even if the user doesn't exist
    }
    return { success: false, error: "Failed to send password reset email" };
  }
}

// RESET PASSWORD (After clicking email link)
export async function resetPassword(prevState: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const oobCode = formData.get("oobCode");
  const newPassword = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  // Check if values exist and are strings
  if (!oobCode || typeof oobCode !== "string") {
    return { success: false, error: "Reset code is required" };
  }

  if (!newPassword || typeof newPassword !== "string") {
    return { success: false, error: "New password is required" };
  }

  if (!confirmPassword || typeof confirmPassword !== "string") {
    return { success: false, error: "Confirm password is required" };
  }

  // Validate the form data
  const result = resetPasswordSchema.safeParse({
    password: newPassword,
    confirmPassword: confirmPassword,
    oobCode
  });

  if (!result.success) {
    const errorMessage = result.error.issues[0]?.message || "Invalid form data";
    return { success: false, error: errorMessage };
  }

  try {
    // Verify the action code using client SDK
    const email = await verifyResetCode(clientAuth, oobCode);
    console.log("Reset code verified for email:", email);

    // Update the password using client SDK
    await confirmReset(clientAuth, oobCode, newPassword);
    console.log("Password updated in Firebase Auth");

    // Hash the new password for Firestore
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Update the password hash in Firestore
    const userRecord = await adminAuth.getUserByEmail(email);
    await adminDb.collection("users").doc(userRecord.uid).update({
      passwordHash: hashedPassword,
      updatedAt: new Date()
    });
    console.log("Password hash updated in Firestore");

    return { success: true };
  } catch (error: any) {
    console.error("Error completing password reset:", error);

    // Provide user-friendly error messages
    if (error.code === "auth/expired-action-code") {
      return { success: false, error: "The password reset link has expired. Please request a new one." };
    } else if (error.code === "auth/invalid-action-code") {
      return { success: false, error: "The password reset link is invalid. Please request a new one." };
    } else if (error.code === "auth/weak-password") {
      return { success: false, error: "The password is too weak. Please choose a stronger password." };
    }

    return { success: false, error: "Failed to reset password. Please try again." };
  }
}

// UPDATE PASSWORD (For logged-in users)
export async function updatePassword(prevState: UpdatePasswordState, formData: FormData): Promise<UpdatePasswordState> {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Safely get form values
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  // Check if values exist and are strings
  if (!currentPassword || typeof currentPassword !== "string") {
    return { success: false, error: "Current password is required" };
  }

  if (!newPassword || typeof newPassword !== "string") {
    return { success: false, error: "New password is required" };
  }

  if (!confirmPassword || typeof confirmPassword !== "string") {
    return { success: false, error: "Confirm password is required" };
  }

  // Validate the form data
  const result = updatePasswordSchema.safeParse({
    currentPassword,
    newPassword,
    confirmPassword
  });

  if (!result.success) {
    const errorMessage = result.error.issues[0]?.message || "Invalid form data";
    return { success: false, error: errorMessage };
  }

  try {
    // Get user data from Firestore to check current password
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.data();

    if (!userData || !userData.passwordHash) {
      return { success: false, error: "User data not found" };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, userData.passwordHash);
    if (!isCurrentPasswordValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const newPasswordHash = await bcryptjs.hash(newPassword, salt);

    // Update password in Firebase Auth
    await adminAuth.updateUser(session.user.id, {
      password: newPassword
    });

    // Update password hash in Firestore
    await adminDb.collection("users").doc(session.user.id).update({
      passwordHash: newPasswordHash,
      updatedAt: new Date()
    });

    // Log the password change
    await logActivity({
      userId: session.user.id,
      type: "password_change",
      description: "Password changed successfully",
      status: "success"
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating password:", error);

    // Provide user-friendly error messages
    if (error.code === "auth/weak-password") {
      return { success: false, error: "The password is too weak. Please choose a stronger password." };
    }

    return { success: false, error: "Failed to update password. Please try again." };
  }
}
