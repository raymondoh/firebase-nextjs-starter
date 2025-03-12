"use server";

import { signIn } from "@/auth";

export async function signInWithFirebase(idToken: string) {
  try {
    const result = await signIn("credentials", {
      idToken,
      redirect: false
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return { success: true };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, error: "Failed to sign in" };
  }
}
