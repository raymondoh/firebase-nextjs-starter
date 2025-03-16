// src/firebase/client/auth.ts
"use client";

import { auth, googleProvider, githubProvider } from "./index";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset
} from "firebase/auth";

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return { success: false, error };
  }
}

/**
 * Sign in with GitHub
 */
export async function signInWithGithub() {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Error signing in with GitHub:", error);
    return { success: false, error };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, error };
  }
}

/**
 * Send a password reset email (client-side)
 */
export async function resetPassword(email: string) {
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
export async function verifyResetCode(code: string) {
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
export async function completePasswordReset(code: string, newPassword: string) {
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
export async function getCurrentUserIdToken() {
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
