// src/firebase/client/next-auth.ts
"use client";

import { signIn } from "next-auth/react";
import type { SignInWithFirebaseInput, SignInWithFirebaseResponse } from "@/types/auth/firebase-auth";

export async function signInWithNextAuth({ idToken }: SignInWithFirebaseInput): Promise<SignInWithFirebaseResponse> {
  try {
    const result = await signIn("credentials", {
      idToken,
      redirect: false
    });

    if (result?.error) {
      return {
        success: false,
        message: "Failed to sign in with credentials",
        error: result.error
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Client sign-in error:", error);
    return {
      success: false,
      message: "An unexpected error occurred during client sign-in",
      error: error instanceof Error ? error.message : undefined
    };
  }
}
