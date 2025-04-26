// "use server";

// import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
// import { serverTimestamp } from "@/utils/date-server";
// import { logActivity } from "@/firebase/actions";
// import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
// import type { UpdateEmailVerificationInput, UpdateEmailVerificationResponse } from "@/types/auth/email-verification";

// export async function updateEmailVerificationStatus({
//   userId,
//   verified
// }: UpdateEmailVerificationInput): Promise<UpdateEmailVerificationResponse> {
//   console.log(`[updateEmailVerificationStatus] START - userId: ${userId}, verified: ${verified}`);

//   if (!userId) {
//     return {
//       success: false,
//       error: "No user ID provided"
//     };
//   }

//   try {
//     const userRecord = await adminAuth.getUser(userId);

//     if (verified && !userRecord.emailVerified) {
//       console.warn(
//         "[updateEmailVerificationStatus] Warning: Firestore marked email verified, but Firebase Auth is not"
//       );
//     }

//     await adminDb.collection("users").doc(userId).update({
//       emailVerified: verified,
//       updatedAt: serverTimestamp()
//     });

//     await logActivity({
//       userId,
//       type: "email_verification_status_updated",
//       description: `Email verification status updated to ${verified}`,
//       status: "success",
//       metadata: { emailVerified: verified }
//     });

//     console.log(`[updateEmailVerificationStatus] SUCCESS - userId: ${userId}`);
//     return { success: true };
//   } catch (error) {
//     const message = isFirebaseError(error)
//       ? firebaseError(error)
//       : error instanceof Error
//       ? error.message
//       : "Unexpected error";

//     console.error("[updateEmailVerificationStatus] ERROR:", message);
//     return {
//       success: false,
//       error: message
//     };
//   }
// }
"use server";

import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { serverTimestamp } from "@/utils/date-server";
import { logActivity } from "@/firebase/actions";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { logServerEvent, logger } from "@/utils/logger";
import type { UpdateEmailVerificationInput, UpdateEmailVerificationResponse } from "@/types/auth/email-verification";

export async function updateEmailVerificationStatus({
  userId,
  verified
}: UpdateEmailVerificationInput): Promise<UpdateEmailVerificationResponse> {
  logger({
    type: "info",
    message: `Starting updateEmailVerificationStatus - userId: ${userId}, verified: ${verified}`,
    context: "auth"
  });

  if (!userId) {
    logger({
      type: "warn",
      message: "No user ID provided to updateEmailVerificationStatus",
      context: "auth"
    });
    return {
      success: false,
      error: "No user ID provided"
    };
  }

  try {
    const userRecord = await adminAuth.getUser(userId);

    if (verified && !userRecord.emailVerified) {
      logger({
        type: "warn",
        message: "Firestore marked email verified, but Firebase Auth is not",
        metadata: { userId, verified },
        context: "auth"
      });
    }

    await adminDb.collection("users").doc(userId).update({
      emailVerified: verified,
      updatedAt: serverTimestamp()
    });

    await logActivity({
      userId,
      type: "email_verification_status_updated",
      description: `Email verification status updated to ${verified}`,
      status: "success",
      metadata: { emailVerified: verified }
    });

    logger({
      type: "info",
      message: `Successfully updated email verification status for userId: ${userId}`,
      context: "auth"
    });

    await logServerEvent({
      type: "auth:update_email_verification",
      message: `Updated email verification status for ${userId}`,
      userId,
      metadata: { emailVerified: verified },
      context: "auth"
    });

    return { success: true };
  } catch (error) {
    logger({
      type: "error",
      message: "Error updating email verification status",
      metadata: { error },
      context: "auth"
    });

    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unexpected error";

    await logServerEvent({
      type: "auth:update_email_verification_error",
      message: `Error updating email verification status for ${userId}`,
      userId,
      metadata: { error: message },
      context: "auth"
    });

    return {
      success: false,
      error: message
    };
  }
}
