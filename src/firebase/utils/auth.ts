// firebase/utils/auth.ts
"use server";

import { adminAuth } from "../admin";
import { createUserDocument, getUserRole } from "./user";
import { auth } from "@/auth";
import type { User, UserRole } from "@/types/user";
import type {
  VerifyAndCreateUserResult,
  GetUserFromTokenResult,
  SendResetPasswordEmailResult,
  VerifyPasswordResetCodeResult,
  ConfirmPasswordResetResult
} from "@/types/firebase";

/**
 * Verify a token and create a user document
 * @param token - The ID token to verify
 */
export async function verifyAndCreateUser(token: string): Promise<VerifyAndCreateUserResult> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    await createUserDocument(decodedToken.uid, {
      id: decodedToken.uid,
      email: decodedToken.email || "",
      name: decodedToken.name || "",
      image: decodedToken.picture || "",
      role: "user"
    });

    return { success: true, uid: decodedToken.uid };
  } catch (error) {
    console.error("Error verifying token:", error);
    return { success: false, error: "Invalid token" };
  }
}

/**
 * Get user information from a token
 * @param token - The ID token
 */
export async function getUserFromToken(token: string): Promise<GetUserFromTokenResult> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { success: true, user: decodedToken };
  } catch (error) {
    console.error("Error getting user from token:", error);
    return { success: false, error: "Invalid token" };
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const role = await getUserRole(session.user.id);
  return {
    id: session.user.id,
    name: session.user.name || "",
    email: session.user.email || "",
    image: session.user.image || "",
    role: role as UserRole
  };
}

/**
 * Send a password reset email
 * @param email - The user's email
 */
export async function sendResetPasswordEmail(email: string): Promise<SendResetPasswordEmailResult> {
  try {
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      handleCodeInApp: true
    };

    await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    // For security reasons, don't reveal if the email exists or not
    if (error.code === "auth/user-not-found") {
      return { success: true };
    }
    return { success: false, error: "Failed to send reset email" };
  }
}

/**
 * Verify a password reset code
 * @param code - The reset code
 */
export async function verifyPasswordResetCode(code: string): Promise<VerifyPasswordResetCodeResult> {
  try {
    const info = await adminAuth.verifyPasswordResetCode(code);
    return { success: true, email: info.email };
  } catch (error) {
    console.error("Error verifying reset code:", error);
    return { success: false, error: "Invalid or expired reset code" };
  }
}

/**
 * Complete a password reset
 * @param code - The reset code
 * @param newPassword - The new password
 */
export async function confirmPasswordReset(code: string, newPassword: string): Promise<ConfirmPasswordResetResult> {
  try {
    await adminAuth.confirmPasswordReset(code, newPassword);
    return { success: true };
  } catch (error) {
    console.error("Error confirming password reset:", error);
    return { success: false, error: "Failed to reset password" };
  }
}
