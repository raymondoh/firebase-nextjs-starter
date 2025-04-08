"use server";

import bcryptjs from "bcryptjs";
import { adminAuth, adminDb } from "@/firebase/admin";
import { loginSchema } from "@/schemas/auth";
import type { LoginState } from "@/types/auth/login";
import type { UserData } from "@/types";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";

export async function loginUser(prevState: LoginState | null, formData: FormData): Promise<LoginState> {
  console.log("loginUser action called with formData:", formData ? "exists" : "null");

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const isRegistration = formData.get("isRegistration") === "true";
  const skipSession = formData.get("skipSession") === "true";

  console.log("Login attempt for email:", email);

  const validationResult = loginSchema.safeParse({ email, password });
  if (!validationResult.success) {
    const errorMessage = validationResult.error.issues[0]?.message || "Invalid form data";
    return {
      success: false,
      message: errorMessage
    };
  }

  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    console.log("Found user in Firebase Auth:", userRecord.uid);

    const isEmailVerified = userRecord.emailVerified;

    if (!isEmailVerified && !isRegistration && !skipSession) {
      return {
        success: false,
        message: "Please verify your email before logging in. Check your inbox for a verification link."
      };
    }

    const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
    const userData = userDoc.data() as UserData | undefined;

    if (!userData || !userData.passwordHash) {
      return {
        success: false,
        message: "Invalid email or password"
      };
    }

    const isPasswordValid = await bcryptjs.compare(password, userData.passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password"
      };
    }

    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return {
      success: true,
      message: "Login successful!",
      userId: userRecord.uid,
      email,
      role: userData.role || "user",
      customToken,
      emailVerified: isEmailVerified
    };
  } catch (error: unknown) {
    console.error("Error during login:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "auth/user-not-found"
    ) {
      return {
        success: false,
        message: "Invalid email or password"
      };
    }

    if (isFirebaseError(error)) {
      return {
        success: false,
        message: firebaseError(error)
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message || "Authentication failed"
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred. Please try again."
    };
  }
}
