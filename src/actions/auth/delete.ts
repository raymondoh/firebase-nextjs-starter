// "use server";
// import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
// import { deleteUserImage } from "@/firebase/admin/auth";
// import { logActivity } from "@/firebase/actions";
// import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
// import type { ActionResponse } from "@/types";

// export interface DeleteUserAsAdminInput {
//   userId: string;
//   adminId: string;
// }

// export async function deleteUserAsAdmin({ userId, adminId }: DeleteUserAsAdminInput): Promise<ActionResponse> {
//   if (!userId || typeof userId !== "string") {
//     return { success: false, error: "Invalid user ID passed to deleteUserAsAdmin" };
//   }

//   try {
//     // 1. Get the user Firestore document
//     const userDocRef = adminDb.collection("users").doc(userId);
//     const userDocSnap = await userDocRef.get();

//     if (!userDocSnap.exists) {
//       return { success: false, error: "User not found in Firestore" };
//     }

//     const userData = userDocSnap.data();
//     const imageUrl = userData?.image || userData?.picture || userData?.photoURL;

//     // 2. Delete user image if exists
//     if (imageUrl) {
//       const imageResult = await deleteUserImage(imageUrl);
//       if (!imageResult.success) {
//         console.warn("⚠️ Failed to delete user image:", imageResult.error);
//       }
//     }

//     // 3. Delete Firestore user doc
//     await userDocRef.delete();

//     // 4. Delete Firebase Auth user
//     await adminAuth.deleteUser(userId);

//     // 5. Log admin activity
//     await logActivity({
//       userId: adminId,
//       type: "admin_deleted_user",
//       description: `Deleted user account (${userId})`,
//       status: "success",
//       metadata: { deletedUserId: userId }
//     });

//     console.log(`✅ Fully deleted user: ${userId}`);
//     return { success: true };
//   } catch (error: unknown) {
//     const message = isFirebaseError(error)
//       ? firebaseError(error)
//       : error instanceof Error
//       ? error.message
//       : "Unknown error deleting user";

//     console.error("❌ Error in deleteUserAsAdmin:", message);
//     return { success: false, error: message };
//   }
// }
"use server";

import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { deleteUserImage } from "@/firebase/admin/auth";
import { logActivity } from "@/firebase/actions";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { logServerEvent, logger } from "@/utils/logger";
import type { ActionResponse } from "@/types";

export interface DeleteUserAsAdminInput {
  userId: string;
  adminId: string;
}

export async function deleteUserAsAdmin({ userId, adminId }: DeleteUserAsAdminInput): Promise<ActionResponse> {
  if (!userId || typeof userId !== "string") {
    logger({ type: "warn", message: "Invalid userId passed to deleteUserAsAdmin", context: "users" });
    return { success: false, error: "Invalid user ID passed to deleteUserAsAdmin" };
  }

  try {
    // 1. Get the user Firestore document
    const userDocRef = adminDb.collection("users").doc(userId);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
      logger({ type: "warn", message: `User not found in Firestore: ${userId}`, context: "users" });
      return { success: false, error: "User not found in Firestore" };
    }

    const userData = userDocSnap.data();
    const imageUrl = userData?.image || userData?.picture || userData?.photoURL;

    // 2. Delete user image if exists
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

    // 3. Delete Firestore user doc
    await userDocRef.delete();
    logger({ type: "info", message: `Deleted Firestore doc for ${userId}`, context: "users" });

    // 4. Delete Firebase Auth user
    await adminAuth.deleteUser(userId);
    logger({ type: "info", message: `Deleted Firebase Auth user ${userId}`, context: "users" });

    // 5. Log admin activity
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

    await logServerEvent({
      type: "admin:delete_user",
      message: `Admin ${adminId} deleted user ${userId}`,
      userId: adminId,
      metadata: { deletedUserId: userId },
      context: "users"
    });

    return { success: true };
  } catch (error: unknown) {
    logger({
      type: "error",
      message: "Error in deleteUserAsAdmin",
      metadata: { error },
      context: "users"
    });

    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error deleting user";

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
