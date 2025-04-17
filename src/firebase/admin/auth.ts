// src/firebase/admin/auth.ts

import { adminAuth, adminDb, adminStorage } from "@/firebase/admin/firebase-admin-init";
import type { GetUserFromTokenResult, SetCustomClaimsResult, CustomClaims } from "@/types/firebase/auth";
import type { VerifyAndCreateUserResult, SendResetPasswordEmailResult } from "@/types/firebase/auth";
import { Timestamp } from "firebase-admin/firestore";
import { createUserDocument } from "./user";
import bcryptjs from "bcryptjs";
import { logActivity } from "@/firebase/admin/activity";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { getUserImage } from "@/utils/get-user-image";

// ================= Firebase User Management =================

/**
 * Create a user in Firebase Auth and Firestore
 */
export async function createUserInFirebase({
  email,
  password,
  displayName,
  createdBy,
  role = "user"
}: {
  email: string;
  password?: string;
  displayName?: string;
  createdBy?: string;
  role?: string;
}): Promise<{ success: true; uid: string } | { success: false; error: string }> {
  try {
    if (!password || password.trim() === "") {
      return { success: false, error: "Password is required to create a user." };
    }

    // 1. Create user in Firebase Auth (hashes password internally)
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName
    });

    const uid = userRecord.uid;

    // 2. Mark email as verified
    await adminAuth.updateUser(uid, { emailVerified: true });

    // 3. Hash password manually for our custom login flow
    const hashedPassword = await bcryptjs.hash(password, 10);

    // 4. Add metadata to Firestore
    const now = Timestamp.now();
    await adminDb
      .collection("users")
      .doc(uid)
      .set({
        email,
        name: displayName || email.split("@")[0],
        role,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        provider: "admin-create",
        status: "active",
        emailVerified: true,
        passwordHash: hashedPassword,
        image: getUserImage({}) // 👈 fallback-safe (resolves to null)
      });

    // 5. Log admin action
    if (createdBy) {
      await logActivity({
        userId: createdBy,
        type: "admin_created_user",
        description: `Created user: ${email}`,
        status: "success",
        metadata: { newUserId: uid, email }
      });
    }

    return { success: true, uid };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error creating user";
    return { success: false, error: message };
  }
}
/**
 * Delete a user As Amin from Admin Dashboard
 */
// src/firebase/admin/auth.ts
export async function deleteUserAsAdmin(
  userId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // 1. Delete Firestore document
    await adminDb.collection("users").doc(userId).delete();

    // 2. Delete Firebase Auth user
    await adminAuth.deleteUser(userId);

    // 3. Attempt to delete profile image
    const fileRef = adminStorage.bucket().file(`users/${userId}/profile.jpg`);
    try {
      await fileRef.delete();
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 404) {
        console.log("Profile image not found, skipping delete.");
      } else {
        console.error("Error deleting profile image:", error);
      }
    }

    // 4. Log activity
    await logActivity({
      userId,
      type: "admin_deleted_user",
      description: "User deleted by admin",
      status: "success",
      metadata: {
        deletedUserId: userId
      }
    });

    return { success: true };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error deleting user";

    console.error("Error in deleteUserAsAdmin:", message);
    return { success: false, error: message };
  }
}

/**
 * Delete a user from Firebase Auth and Firestore
 */
export async function deleteUser(uid: string) {
  try {
    await adminAuth.deleteUser(uid);
    return { success: true };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error deleting user";
    return { success: false, error: message };
  }
}

/**
 * Get a Firebase user by UID
 */
export async function getUser(uid: string) {
  try {
    const user = await adminAuth.getUser(uid);
    return { success: true, data: user };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error getting user";
    return { success: false, error: message };
  }
}

/**
 * Get a Firebase user by email
 */
export async function getUserByEmail(email: string) {
  try {
    const user = await adminAuth.getUserByEmail(email);
    return { success: true, data: user };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error getting user by email";
    return { success: false, error: message };
  }
}

/**
 * Update a user's properties in Firebase Auth
 */
export async function updateUser(
  uid: string,
  properties: { displayName?: string; photoURL?: string; password?: string }
) {
  try {
    const user = await adminAuth.updateUser(uid, properties);
    return { success: true, data: user };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error updating user";
    return { success: false, error: message };
  }
}

// ================= Firebase User Authentication =================

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

/**
 * Send a password reset email for a user
 */
export async function sendResetPasswordEmail(email: string): Promise<SendResetPasswordEmailResult> {
  try {
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      handleCodeInApp: true
    };

    await adminAuth.generatePasswordResetLink(email, actionCodeSettings);

    return { success: true };
  } catch (error: unknown) {
    if (isFirebaseError(error) && error.code === "auth/user-not-found") {
      return { success: true }; // Silent success for security reasons
    }

    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Failed to send reset email";

    return { success: false, error: message };
  }
}

/**
 * Decode and return user from token
 */
export async function getUserFromToken(token: string): Promise<GetUserFromTokenResult> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { success: true, user: decodedToken };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Invalid token";
    return { success: false, error: message };
  }
}

/**
 * Verify ID token and return decoded token data
 */
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { success: true, data: decodedToken };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Invalid ID token";
    return { success: false, error: message };
  }
}

// ================= Firebase Custom Claims =================

/**
 * Set custom claims for a user
 */
export async function setCustomClaims(uid: string, claims: CustomClaims): Promise<SetCustomClaimsResult> {
  try {
    await adminAuth.setCustomUserClaims(uid, claims);
    return { success: true };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error setting custom claims";
    return { success: false, error: message };
  }
}
export async function verifyAndCreateUser(token: string): Promise<VerifyAndCreateUserResult> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    await createUserDocument(decodedToken.uid, {
      id: decodedToken.uid,
      email: decodedToken.email || "",
      name: decodedToken.name || "",
      image: getUserImage(decodedToken),
      role: "user"
    });

    return { success: true, uid: decodedToken.uid };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Invalid token";

    return { success: false, error: message };
  }
}
