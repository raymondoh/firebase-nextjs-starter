// src/firebase/client/auth.ts
"use client";

import { User } from "@/types";
import type { User as FirebaseUser } from "firebase/auth";
import type { User as AppUser } from "@/types/user";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
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

function mapFirebaseUser(firebaseUser: FirebaseUser): AppUser {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName ?? null,
    email: firebaseUser.email ?? null,
    image: firebaseUser.photoURL ?? null,
    emailVerified: firebaseUser.emailVerified,
    provider: firebaseUser.providerId
  };
}

// Configure Firebase Auth action code settings
const actionCodeSettings: ActionCodeSettings = {
  url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth-action`,
  handleCodeInApp: false
};

// Function to apply these settings when sending verification emails
export function getVerificationSettings(): ActionCodeSettings {
  return {
    ...actionCodeSettings
    // No need to add user ID to URL since we're using a universal handler
    // url: actionCodeSettings.url, // Using the base url
  };
}

// Configure Firebase Auth action code settings for password reset
export function getPasswordResetSettings(): ActionCodeSettings {
  return {
    ...actionCodeSettings
    // url: actionCodeSettings.url, // Using the base url
  };
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    return { success: true, user: mapFirebaseUser(result.user) };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error occurred during Google sign-in";

    console.error("Error signing in with Google:", message);
    return { success: false, error: message };
  }
}

/**
 * Sign in with GitHub
 */
export async function signInWithGithub(): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const result: UserCredential = await signInWithPopup(auth, githubProvider);
    return { success: true, user: mapFirebaseUser(result.user) };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error occurred during GitHub sign-in";

    console.error("Error signing in with GitHub:", message);
    return { success: false, error: message };
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error occurred during sign-out";

    console.error("Error signing out:", message);
    return { success: false, error: message };
  }
}

/**
 * Send a password reset email (client-side)
 */
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email, getPasswordResetSettings());
    return { success: true };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "An unknown error occurred while sending reset email";

    console.error("Error sending password reset email:", message);
    return { success: false, error: message };
  }
}

/**
 * Verify a password reset code (client-side)
 */
export async function verifyResetCode(
  code: string
): Promise<{ success: boolean; email?: string | null; error?: string }> {
  try {
    const email = await verifyPasswordResetCode(auth, code);
    return { success: true, email };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "An unknown error occurred while verifying reset code";

    console.error("Error verifying reset code:", message);
    return { success: false, error: message };
  }
}

/**
 * Complete a password reset (client-side)
 */

export async function completePasswordReset(
  code: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await confirmPasswordReset(auth, code, newPassword);
    return { success: true };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "An unknown error occurred while confirming reset";

    console.error("Error confirming password reset:", message);
    return { success: false, error: message };
  }
}

/**
 * Get the current user's ID token
 */
export async function getCurrentUserIdToken(): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: "No user is signed in" };
    }

    const token = await user.getIdToken();
    return { success: true, token };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Failed to retrieve ID token";

    console.error("Error getting ID token:", message);
    return { success: false, error: message };
  }
}

/**
 * Sends a verification email to the specified user
 * @returns Promise that resolves when the email has been sent
 *   metadata: Record<string, unknown>;
 */
export const sendVerificationEmail = async (
  user: { id: string; email: string; emailVerified: boolean } | null
): Promise<void> => {
  if (!user) {
    const message = "No user provided";
    console.error(message);
    return Promise.reject(message);
  }

  try {
    if (!auth.currentUser) {
      const message = "currentUser is null";
      console.error(message);
      return Promise.reject(message);
    }

    const settings = getVerificationSettings();
    const urlWithUid = auth.currentUser.uid ? `${settings.url}?uid=${auth.currentUser.uid}` : settings.url;

    await sendEmailVerification(auth.currentUser, { ...settings, url: urlWithUid });

    console.log("Verification email sent successfully");
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Failed to send verification email";

    console.error("Error sending verification email:", message);
    return Promise.reject(message);
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
export const refreshUserStatus = async (user: { reload: () => Promise<void> } | null): Promise<void> => {
  if (!user) {
    const message = "No user provided";
    console.error(message);
    return Promise.reject(message);
  }

  try {
    await user.reload();
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Failed to refresh user status";

    console.error("Error refreshing user status:", message);
    return Promise.reject(message);
  }
};
