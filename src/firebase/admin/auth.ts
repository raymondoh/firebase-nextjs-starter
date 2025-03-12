// firebase/admin/auth.ts
"use server";

import { adminAuth } from "./index";
import type { SetCustomClaimsResult } from "@/types/firebase";

// Functions for interacting with Firebase Auth

/**
 * Set custom claims for a user
 * @param uid - The user ID
 * @param claims - The custom claims to set
 */
export async function setCustomClaims(uid: string, claims: Record<string, any>): Promise<SetCustomClaimsResult> {
  try {
    await adminAuth.setCustomUserClaims(uid, claims);
    console.log("Custom claims set successfully");
    return { success: true };
  } catch (error) {
    console.error("Error setting custom claims:", error);
    return { success: false, error };
  }
}

/**
 * Generate a password reset link
 * @param email - The user's email
 * @param actionCodeSettings - Settings for the reset link
 */
// export async function generatePasswordResetLink(
//   email: string,
//   actionCodeSettings: { url: string; handleCodeInApp: boolean }
// ): Promise<string> {
//   return adminAuth.generatePasswordResetLink(email, actionCodeSettings);
// }

/**
 * Verify a password reset code
 * @param code - The reset code
 */
// export async function verifyPasswordResetCode(code: string): Promise<{ email: string }> {
//   return adminAuth.verifyPasswordResetCode(code);
// }

/**
 * Confirm a password reset
 * @param code - The reset code
 * @param newPassword - The new password
 */
// export async function confirmPasswordReset(code: string, newPassword: string): Promise<void> {
//   return adminAuth.confirmPasswordReset(code, newPassword);
// }

/**
 * Get a user by email
 * @param email - The user's email
 */
export async function getUserByEmail(email: string) {
  return adminAuth.getUserByEmail(email);
}

/**
 * Get a user by ID
 * @param uid - The user ID
 */
export async function getUser(uid: string) {
  return adminAuth.getUser(uid);
}

/**
 * Update a user
 * @param uid - The user ID
 * @param properties - The properties to update
 */
export async function updateUser(
  uid: string,
  properties: { displayName?: string; photoURL?: string; password?: string }
) {
  return adminAuth.updateUser(uid, properties);
}

/**
 * Create a new user
 * @param properties - The user properties
 */
export async function createUser(properties: { email: string; password: string; displayName?: string }) {
  return adminAuth.createUser(properties);
}

/**
 * Delete a user
 * @param uid - The user ID
 */
export async function deleteUser(uid: string) {
  return adminAuth.deleteUser(uid);
}

/**
 * Verify an ID token
 * @param token - The ID token
 */
export async function verifyIdToken(token: string) {
  return adminAuth.verifyIdToken(token);
}
