// //src/actions/auth/firebase-auth.ts
// "use server";

// import { signIn } from "@/auth";
// import { adminAuth } from "@/firebase/admin/firebase-admin-init";
// import { logActivity } from "@/firebase/actions";
// import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
// import { logServerEvent, logger } from "@/utils/logger";
// import type { SignInWithFirebaseInput, SignInWithFirebaseResponse } from "@/types/auth/firebase-auth";

// export async function signInWithFirebase({ idToken }: SignInWithFirebaseInput): Promise<SignInWithFirebaseResponse> {
//   let uid = "unknown";

//   try {
//     const decodedToken = await adminAuth.verifyIdToken(idToken);
//     uid = decodedToken.uid;

//     logger({
//       type: "info",
//       message: `Verified ID token for uid: ${uid}`,
//       context: "auth"
//     });

//     const result = await signIn("credentials", {
//       idToken,
//       redirect: false
//     });

//     if (result?.error) {
//       logger({
//         type: "warn",
//         message: `Firebase credential login failed for uid: ${uid}`,
//         metadata: { error: result.error },
//         context: "auth"
//       });

//       await logActivity({
//         userId: uid,
//         type: "login",
//         description: "Firebase credential login failed",
//         status: "failed",
//         metadata: { error: result.error }
//       });

//       await logServerEvent({
//         type: "auth:firebase_credential_login_failed",
//         message: `Firebase credential login failed for uid: ${uid}`,
//         userId: uid,
//         metadata: { error: result.error },
//         context: "auth"
//       });

//       return {
//         success: false,
//         error: result.error,
//         message: "Firebase credential login failed"
//       };
//     }

//     logger({
//       type: "info",
//       message: `Firebase credential login succeeded for uid: ${uid}`,
//       context: "auth"
//     });

//     await logServerEvent({
//       type: "auth:firebase_credential_login_success",
//       message: `Firebase credential login succeeded for uid: ${uid}`,
//       userId: uid,
//       context: "auth"
//     });

//     return { success: true };
//   } catch (error) {
//     logger({
//       type: "error",
//       message: `Error during signInWithFirebase`,
//       metadata: { error },
//       context: "auth"
//     });

//     const message = isFirebaseError(error)
//       ? firebaseError(error)
//       : error instanceof Error
//       ? error.message
//       : "Unknown sign-in error";

//     await logActivity({
//       userId: uid,
//       type: "login",
//       description: "Firebase credential sign-in failed",
//       status: "failed",
//       metadata: { error: message }
//     });

//     await logServerEvent({
//       type: "auth:firebase_credential_signin_error",
//       message: `Error during Firebase credential sign-in for uid: ${uid}`,
//       userId: uid,
//       metadata: { error: message },
//       context: "auth"
//     });

//     return {
//       success: false,
//       error: message,
//       message: "An error occurred during sign-in"
//     };
//   }
// }
"use server";

// ================= Imports =================
import { signIn } from "@/auth";
import { adminAuth } from "@/firebase/admin/firebase-admin-init";
import { logActivity } from "@/firebase/actions";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { logServerEvent, logger } from "@/utils/logger";
import type { SignInWithFirebaseInput, SignInWithFirebaseResponse } from "@/types/auth/firebase-auth";

// ================= Sign In With Firebase =================

/**
 * Signs in a user with a Firebase ID token.
 * Verifies the token, attempts to authenticate via NextAuth credentials provider,
 * and logs the result.
 */
export async function signInWithFirebase({ idToken }: SignInWithFirebaseInput): Promise<SignInWithFirebaseResponse> {
  let uid = "unknown";

  try {
    // 1. Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    uid = decodedToken.uid;

    logger({
      type: "info",
      message: `Verified ID token`,
      metadata: { uid },
      context: "auth"
    });

    // 2. Attempt NextAuth credential login
    const result = await signIn("credentials", {
      idToken,
      redirect: false
    });

    if (result?.error) {
      // 3a. Handle login failure
      logger({
        type: "warn",
        message: "Firebase credential login failed",
        metadata: { uid, error: result.error },
        context: "auth"
      });

      await logActivity({
        userId: uid,
        type: "login",
        description: "Firebase credential login failed",
        status: "failed",
        metadata: { error: result.error }
      });

      await logServerEvent({
        type: "auth:firebase_credential_login_failed",
        message: "Firebase credential login failed",
        userId: uid,
        metadata: { error: result.error },
        context: "auth"
      });

      return { success: false, error: result.error, message: "Firebase credential login failed" };
    }

    // 3b. Handle login success
    logger({
      type: "info",
      message: "Firebase credential login succeeded",
      metadata: { uid },
      context: "auth"
    });

    await logServerEvent({
      type: "auth:firebase_credential_login_success",
      message: "Firebase credential login succeeded",
      userId: uid,
      context: "auth"
    });

    return { success: true };
  } catch (error) {
    // 4. Handle any unexpected errors
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown sign-in error";

    logger({
      type: "error",
      message: "Error during signInWithFirebase",
      metadata: { uid, error },
      context: "auth"
    });

    await logActivity({
      userId: uid,
      type: "login",
      description: "Firebase credential sign-in failed",
      status: "failed",
      metadata: { error: message }
    });

    await logServerEvent({
      type: "auth:firebase_credential_signin_error",
      message: "Error during Firebase credential sign-in",
      userId: uid,
      metadata: { error: message },
      context: "auth"
    });

    return { success: false, error: message, message: "An error occurred during sign-in" };
  }
}
