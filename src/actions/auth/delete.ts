"use server";
import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { deleteUserImage } from "@/firebase/admin/auth";
import { logActivity } from "@/firebase/actions";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import type { ActionResponse } from "@/types";

export interface DeleteUserAsAdminInput {
  userId: string;
  adminId: string;
}

export async function deleteUserAsAdmin({ userId, adminId }: DeleteUserAsAdminInput): Promise<ActionResponse> {
  if (!userId || typeof userId !== "string") {
    return { success: false, error: "Invalid user ID passed to deleteUserAsAdmin" };
  }

  try {
    // 1. Get the user Firestore document
    const userDocRef = adminDb.collection("users").doc(userId);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
      return { success: false, error: "User not found in Firestore" };
    }

    const userData = userDocSnap.data();
    const imageUrl = userData?.image || userData?.picture || userData?.photoURL;

    // 2. Delete user image if exists
    if (imageUrl) {
      const imageResult = await deleteUserImage(imageUrl);
      if (!imageResult.success) {
        console.warn("⚠️ Failed to delete user image:", imageResult.error);
      }
    }

    // 3. Delete Firestore user doc
    await userDocRef.delete();

    // 4. Delete Firebase Auth user
    await adminAuth.deleteUser(userId);

    // 5. Log admin activity
    await logActivity({
      userId: adminId,
      type: "admin_deleted_user",
      description: `Deleted user account (${userId})`,
      status: "success",
      metadata: { deletedUserId: userId }
    });

    console.log(`✅ Fully deleted user: ${userId}`);
    return { success: true };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error deleting user";

    console.error("❌ Error in deleteUserAsAdmin:", message);
    return { success: false, error: message };
  }
}
