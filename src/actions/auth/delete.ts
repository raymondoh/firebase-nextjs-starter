"use server";

import { adminAuth, adminDb, adminStorage } from "@/firebase/admin/firebase-admin-init";
import { logActivity } from "@/firebase/actions";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import type { ActionResponse } from "@/types";

export interface DeleteUserAsAdminInput {
  userId: string;
  adminId: string;
}

export async function deleteUserAsAdmin({ userId, adminId }: DeleteUserAsAdminInput): Promise<ActionResponse> {
  try {
    // 1. Delete Firestore user document
    await adminDb.collection("users").doc(userId).delete();

    // 2. Delete from Firebase Auth
    await adminAuth.deleteUser(userId);

    // 3. Delete user profile image from Firebase Storage
    const profileImage = adminStorage.bucket().file(`users/${userId}/profile.jpg`);

    try {
      await profileImage.delete();
    } catch (err) {
      const is404 = typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 404;

      if (is404) {
        console.log("Profile image not found, skipping.");
      } else {
        console.warn("⚠️ Storage deletion issue:", err);
      }
    }

    // 4. Log admin activity
    await logActivity({
      userId: adminId,
      type: "admin_deleted_user",
      description: `Deleted user account (${userId})`,
      status: "success",
      metadata: { deletedUserId: userId }
    });

    return { success: true };
  } catch (error) {
    let message = "Unknown error deleting user.";
    if (isFirebaseError(error)) {
      message = firebaseError(error);
    } else if (error instanceof Error) {
      message = error.message;
    }

    console.error("❌ Admin user deletion failed:", error);
    return { success: false, error: message };
  }
}
