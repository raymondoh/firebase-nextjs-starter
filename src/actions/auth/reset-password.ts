// "use server";

// import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
// import { serverTimestamp } from "@/firebase/admin/firestore";
// import { logActivity } from "@/firebase/actions";
// import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
// import { hashPassword } from "@/utils/hashPassword";

// import type {
//   LogPasswordResetInput,
//   ResetPasswordResponse,
//   GetUserIdByEmailInput,
//   GetUserIdByEmailResponse,
//   UpdatePasswordHashInput
// } from "@/types/auth/password";
// import type { ActionResponse } from "@/types";

// /**
//  * Logs a password reset activity
//  */
// export async function logPasswordResetActivity({ email }: LogPasswordResetInput): Promise<ResetPasswordResponse> {
//   if (!email) return { success: false, error: "Email is required" };

//   try {
//     const userRecord = await adminAuth.getUserByEmail(email);

//     if (userRecord) {
//       await logActivity({
//         userId: userRecord.uid,
//         type: "password_reset_requested",
//         description: "Password reset email sent",
//         status: "success",
//         metadata: { email }
//       });
//     }

//     return { success: true };
//   } catch (error: unknown) {
//     if (isFirebaseError(error) && error.code !== "auth/user-not-found") {
//       console.error("[PASSWORD_RESET] Error logging activity:", firebaseError(error));
//     }
//     return { success: true }; // Silent fail
//   }
// }

// /**
//  * Gets a user ID by email
//  */
// export async function getUserIdByEmail({ email }: GetUserIdByEmailInput): Promise<GetUserIdByEmailResponse> {
//   if (!email) {
//     return { success: false, error: "Email is required" };
//   }

//   try {
//     const userRecord = await adminAuth.getUserByEmail(email);
//     return { success: true, userId: userRecord.uid };
//   } catch (error: unknown) {
//     console.error("[PASSWORD_RESET] Error getting user ID:", error);

//     if (
//       typeof error === "object" &&
//       error !== null &&
//       "code" in error &&
//       (error as { code?: string }).code === "auth/user-not-found"
//     ) {
//       return { success: false, error: "User not found" };
//     }

//     if (isFirebaseError(error)) {
//       return { success: false, error: firebaseError(error) };
//     }

//     return { success: false, error: "Failed to get user ID" };
//   }
// }

// /**
//  * Updates password hash in Firestore
//  */
// export async function updatePasswordHash({ userId, newPassword }: UpdatePasswordHashInput): Promise<ActionResponse> {
//   if (!userId || !newPassword) {
//     return { success: false, error: "User ID and new password are required" };
//   }

//   try {
//     const passwordHash = await hashPassword(newPassword);

//     await adminDb.collection("users").doc(userId).update({
//       passwordHash,
//       updatedAt: serverTimestamp()
//     });

//     await logActivity({
//       userId,
//       type: "password_reset_completed",
//       description: "Password reset completed",
//       status: "success"
//     });

//     return { success: true };
//   } catch (error: unknown) {
//     const message = isFirebaseError(error)
//       ? firebaseError(error)
//       : error instanceof Error
//       ? error.message
//       : "Unknown error";

//     return { success: false, error: message };
//   }
// }
"use server";

import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
// Updated import for serverTimestamp from the new date helper:
import { serverTimestamp } from "@/utils/date-server";
import { logActivity } from "@/firebase/actions";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { hashPassword } from "@/utils/hashPassword";

import type {
  LogPasswordResetInput,
  ResetPasswordResponse,
  GetUserIdByEmailInput,
  GetUserIdByEmailResponse,
  UpdatePasswordHashInput
} from "@/types/auth/password";
import type { ActionResponse } from "@/types";

/**
 * Logs a password reset activity
 */
export async function logPasswordResetActivity({ email }: LogPasswordResetInput): Promise<ResetPasswordResponse> {
  if (!email) return { success: false, error: "Email is required" };

  try {
    const userRecord = await adminAuth.getUserByEmail(email);

    if (userRecord) {
      await logActivity({
        userId: userRecord.uid,
        type: "password_reset_requested",
        description: "Password reset email sent",
        status: "success",
        metadata: { email }
      });
    }

    return { success: true };
  } catch (error: unknown) {
    if (isFirebaseError(error) && error.code !== "auth/user-not-found") {
      console.error("[PASSWORD_RESET] Error logging activity:", firebaseError(error));
    }
    return { success: true }; // Silent fail
  }
}

/**
 * Gets a user ID by email
 */
export async function getUserIdByEmail({ email }: GetUserIdByEmailInput): Promise<GetUserIdByEmailResponse> {
  if (!email) {
    return { success: false, error: "Email is required" };
  }

  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    return { success: true, userId: userRecord.uid };
  } catch (error: unknown) {
    console.error("[PASSWORD_RESET] Error getting user ID:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "auth/user-not-found"
    ) {
      return { success: false, error: "User not found" };
    }

    if (isFirebaseError(error)) {
      return { success: false, error: firebaseError(error) };
    }

    return { success: false, error: "Failed to get user ID" };
  }
}

/**
 * Updates password hash in Firestore
 */
export async function updatePasswordHash({ userId, newPassword }: UpdatePasswordHashInput): Promise<ActionResponse> {
  if (!userId || !newPassword) {
    return { success: false, error: "User ID and new password are required" };
  }

  try {
    const passwordHash = await hashPassword(newPassword);

    await adminDb.collection("users").doc(userId).update({
      passwordHash,
      updatedAt: serverTimestamp()
    });

    await logActivity({
      userId,
      type: "password_reset_completed",
      description: "Password reset completed",
      status: "success"
    });

    return { success: true };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error";

    return { success: false, error: message };
  }
}
