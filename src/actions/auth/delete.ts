"use server";

// ================= Imports =================
import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { deleteUserImage } from "@/firebase/admin/auth";
import { logActivity } from "@/firebase/actions";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { logServerEvent, logger } from "@/utils/logger";
import type { ActionResponse } from "@/types";

// ================= Types =================

export interface DeleteUserAsAdminInput {
  userId: string;
  adminId: string;
}

// ================= Delete User (Admin) =================

/**
 * Deletes a user from Firestore, Firebase Auth, and optionally Storage.
 * Logs the deletion for auditing purposes.
 */
export async function deleteUserAsAdmin({ userId, adminId }: DeleteUserAsAdminInput): Promise<ActionResponse> {
  if (!userId || typeof userId !== "string") {
    logger({ type: "warn", message: "Invalid userId passed to deleteUserAsAdmin", context: "users" });
    return { success: false, error: "Invalid user ID passed to deleteUserAsAdmin" };
  }

  try {
    // 1. Fetch Firestore user document
    const userDocRef = adminDb.collection("users").doc(userId);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
      logger({ type: "warn", message: `User not found in Firestore: ${userId}`, context: "users" });
      return { success: false, error: "User not found in Firestore" };
    }

    const userData = userDocSnap.data();
    const imageUrl = userData?.image || userData?.picture || userData?.photoURL;

    // 2. Delete user image from Storage (if exists)
    if (imageUrl) {
      const imageResult = await deleteUserImage(imageUrl);
      if (!imageResult.success) {
        logger({
          type: "warn",
          message: `Failed to delete user image for ${userId}`,
          metadata: { error: imageResult.error },
          context: "users"
        });
      } else {
        logger({ type: "info", message: `Deleted user image for ${userId}`, context: "users" });
      }
    }

    // 3. Delete Firestore user document
    await userDocRef.delete();
    logger({ type: "info", message: `Deleted Firestore document for user ${userId}`, context: "users" });

    // 4. Delete user from Firebase Auth
    await adminAuth.deleteUser(userId);
    logger({ type: "info", message: `Deleted Firebase Auth user ${userId}`, context: "users" });

    // 5. Log admin deletion activity (non-blocking)
    try {
      await logActivity({
        userId: adminId,
        type: "admin_deleted_user",
        description: `Deleted user account (${userId})`,
        status: "success",
        metadata: { deletedUserId: userId }
      });
    } catch (logError) {
      logger({
        type: "error",
        message: "Failed to log admin delete activity",
        metadata: { logError },
        context: "users"
      });
    }

    // 6. Log server event for auditing
    await logServerEvent({
      type: "admin:delete_user",
      message: `Admin ${adminId} deleted user ${userId}`,
      userId: adminId,
      metadata: { deletedUserId: userId },
      context: "users"
    });

    return { success: true };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error deleting user";

    logger({
      type: "error",
      message: "Error in deleteUserAsAdmin",
      metadata: { error: message },
      context: "users"
    });

    await logServerEvent({
      type: "admin:delete_user_error",
      message: `Error deleting user ${userId}`,
      userId: adminId,
      metadata: { error: message },
      context: "users"
    });

    return { success: false, error: message };
  }
}
