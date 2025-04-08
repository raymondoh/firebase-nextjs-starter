// src/actions/auth/firebase-auth.ts
"use server";

import { signIn } from "@/auth";
import { adminAuth } from "@/firebase/admin";
import { logActivity } from "@/firebase/actions";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";

export async function signInWithFirebase(idToken: string) {
  try {
    // Decode the Firebase ID token to extract UID
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const result = await signIn("credentials", {
      idToken,
      redirect: false
    });

    if (result?.error) {
      await logActivity({
        userId,
        type: "login",
        description: "Firebase credential login failed",
        status: "failed",
        metadata: { error: result.error }
      });
      throw new Error(result.error);
    }

    return { success: true };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown sign-in error";

    console.error("Sign in error:", message);

    // Best-effort UID extraction for failed decoding
    let uid = "unknown";
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      uid = decoded.uid;
    } catch (verifyError) {
      console.warn("Could not verify ID token to extract UID:", verifyError);
    }

    await logActivity({
      userId: uid,
      type: "login",
      description: "Firebase credential sign-in failed",
      status: "failed",
      metadata: { error: message }
    });

    return { success: false, error: message };
  }
}
