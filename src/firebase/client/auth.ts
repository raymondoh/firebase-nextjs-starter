// src/firebase/client/auth.ts
"use client";

import { User } from "@/types";
import { auth, googleProvider, githubProvider } from "./index";
import {
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  UserCredential,
  ActionCodeSettings
} from "firebase/auth";

// Configure Firebase Auth action code settings
export const actionCodeSettings: ActionCodeSettings = {
  // URL you want to redirect back to after email verification
  url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email`,
  // This must be false for email verification to work with custom handling
  handleCodeInApp: false
};

// Function to apply these settings when sending verification emails
export function getVerificationSettings(): ActionCodeSettings {
  // Try to include the current user's UID in the continue URL if available
  const currentUser = auth.currentUser;
  let url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email`;

  // If we have a current user, add their UID to the URL
  if (currentUser) {
    url += `?uid=${currentUser.uid}`;
  }

  return {
    ...actionCodeSettings,
    url
  };
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: any }> {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user as User };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return { success: false, error };
  }
}

/**
 * Sign in with GitHub
 */
export async function signInWithGithub(): Promise<{ success: boolean; user?: User; error?: any }> {
  try {
    const result: UserCredential = await signInWithPopup(auth, githubProvider);
    return { success: true, user: result.user as User };
  } catch (error) {
    console.error("Error signing in with GitHub:", error);
    return { success: false, error };
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<{ success: boolean; error?: any }> {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, error };
  }
}

/**
 * Send a password reset email (client-side)
 */
export async function resetPassword(email: string): Promise<{ success: boolean; error?: any }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
}

/**
 * Verify a password reset code (client-side)
 */
export async function verifyResetCode(code: string): Promise<{ success: boolean; email?: string | null; error?: any }> {
  try {
    const email = await verifyPasswordResetCode(auth, code);
    return { success: true, email };
  } catch (error) {
    console.error("Error verifying reset code:", error);
    return { success: false, error };
  }
}

/**
 * Complete a password reset (client-side)
 */
export async function completePasswordReset(
  code: string,
  newPassword: string
): Promise<{ success: boolean; error?: any }> {
  try {
    await confirmPasswordReset(auth, code, newPassword);
    return { success: true };
  } catch (error) {
    console.error("Error confirming password reset:", error);
    return { success: false, error };
  }
}

/**
 * Get the current user's ID token
 */
export async function getCurrentUserIdToken(): Promise<{ success: boolean; token?: string; error?: any }> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: "No user is signed in" };
    }

    const token = await user.getIdToken();
    return { success: true, token };
  } catch (error) {
    console.error("Error getting ID token:", error);
    return { success: false, error };
  }
}

/**
 * Sends a verification email to the specified user
 * @returns Promise that resolves when the email has been sent
 */
export const sendVerificationEmail = async (
  user: { id: string; email: string; emailVerified: boolean; metadata: any } | null
): Promise<void> => {
  if (!user) {
    console.error("No user provided for verification email");
    return Promise.reject("No user provided");
  }
  try {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      console.log("Verification email sent successfully");
      return Promise.resolve();
    } else {
      console.error("currentUser is null");
      return Promise.reject("currentUser is null");
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
    return Promise.reject(error);
  }
};

/**
 * Checks if the user's email is verified
 * @returns Boolean indicating if email is verified
 */
export const isEmailVerified = (user: { emailVerified: boolean } | null): boolean => {
  return user?.emailVerified ?? false;
};

/**
 * Refreshes the user's token to get the latest emailVerified status
 * @param user The Firebase user object
 * @returns Promise that resolves with the updated user
 */
export const refreshUserStatus = async (
  user: { reload: () => Promise<void> } | null
): Promise<{ reload: () => Promise<void> } | void> => {
  if (!user) {
    console.error("No user provided for refreshing status");
    return Promise.reject("No user provided");
  }
  try {
    await user.reload();
    return Promise.resolve();
  } catch (error) {
    console.error("Error refreshing user status:", error);
    return Promise.reject(error);
  }
};
