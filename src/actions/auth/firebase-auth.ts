"use server";

import { signIn } from "@/auth";
import { adminAuth } from "@/firebase/admin/firebase-admin-init";
import { logActivity } from "@/firebase/actions";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import type { SignInWithFirebaseInput, SignInWithFirebaseResponse } from "@/types/auth/firebase-auth";

export async function signInWithFirebase({ idToken }: SignInWithFirebaseInput): Promise<SignInWithFirebaseResponse> {
  let uid = "unknown";

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    uid = decodedToken.uid;

    const result = await signIn("credentials", {
      idToken,
      redirect: false
    });

    if (result?.error) {
      await logActivity({
        userId: uid,
        type: "login",
        description: "Firebase credential login failed",
        status: "failed",
        metadata: { error: result.error }
      });

      return {
        success: false,
        error: result.error,
        message: "Firebase credential login failed"
      };
    }

    return { success: true };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown sign-in error";

    console.error("[signInWithFirebase] Error:", message);

    await logActivity({
      userId: uid,
      type: "login",
      description: "Firebase credential sign-in failed",
      status: "failed",
      metadata: { error: message }
    });

    return {
      success: false,
      error: message,
      message: "An error occurred during sign-in"
    };
  }
}
