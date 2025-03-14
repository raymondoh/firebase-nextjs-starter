"use server";

import { adminAuth } from "./admin";
import { createUserDocument, getUserRole } from "./user";
import { auth } from "@/auth";
import type { User, UserRole } from "@/types/user";
import type {
  VerifyAndCreateUserResult,
  GetUserFromTokenResult,
  SendResetPasswordEmailResult
} from "@/types/firebase/auth";

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

export async function getUserFromToken(token: string): Promise<GetUserFromTokenResult> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { success: true, user: decodedToken };
  } catch (error) {
    console.error("Error getting user from token:", error);
    return { success: false, error: "Invalid token" };
  }
}

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

export async function sendResetPasswordEmail(email: string): Promise<SendResetPasswordEmailResult> {
  try {
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      handleCodeInApp: true
    };

    await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error sending password reset email:", error);
    // For security reasons, don't reveal if the email exists or not
    if (error && typeof error === "object" && "code" in error && error.code === "auth/user-not-found") {
      return { success: true };
    }
    return { success: false, error: "Failed to send reset email" };
  }
}

// Add a function to verify password reset code
export async function verifyPasswordResetCode(
  code: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  try {
    // Firebase Admin SDK doesn't have verifyPasswordResetCode
    // We need to use a different approach or the client SDK
    // This is a placeholder - you'll need to implement this differently
    const email = await getEmailFromResetCode(code);
    return { success: true, email };
  } catch (error) {
    console.error("Error verifying reset code:", error);
    return { success: false, error: "Invalid or expired reset code" };
  }
}

// Helper function to get email from reset code (placeholder)
async function getEmailFromResetCode(code: string): Promise<string> {
  // Implementation depends on your Firebase setup
  // You might need to use the client SDK or a custom solution
  throw new Error("Not implemented");
}

// Add a function to complete password reset
export async function confirmPasswordReset(
  code: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Firebase Admin SDK doesn't have confirmPasswordReset
    // We need to use a different approach or the client SDK
    // This is a placeholder - you'll need to implement this differently
    await resetPassword(code, newPassword);
    return { success: true };
  } catch (error) {
    console.error("Error confirming password reset:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

// Helper function to reset password (placeholder)
async function resetPassword(code: string, newPassword: string): Promise<void> {
  // Implementation depends on your Firebase setup
  // You might need to use the client SDK or a custom solution
  throw new Error("Not implemented");
}
