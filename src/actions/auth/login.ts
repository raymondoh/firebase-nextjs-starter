"use server";

import bcryptjs from "bcryptjs";
import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { loginSchema } from "@/schemas/auth";
import type { LoginResponse } from "@/types/auth/login";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";

export async function loginUser(_prevState: LoginResponse | null, formData: FormData): Promise<LoginResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const isRegistration = formData.get("isRegistration") === "true";
  const skipSession = formData.get("skipSession") === "true";

  // Step 1: Validate input
  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid form data"
    };
  }

  try {
    // Step 2: Get user record from Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(email);
    const isEmailVerified = userRecord.emailVerified;

    if (!isEmailVerified && !isRegistration && !skipSession) {
      return {
        success: false,
        message: "Please verify your email before logging in. Check your inbox for a verification link."
      };
    }

    // Step 3: Validate Firestore password hash
    const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
    const userData = userDoc.data();

    if (!userData?.passwordHash) {
      return { success: false, message: "Invalid email or password" };
    }

    const isPasswordValid = await bcryptjs.compare(password, userData.passwordHash);
    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password" };
    }

    // Step 4: Return custom token for client-side Firebase sign in
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return {
      success: true,
      message: "Login successful!",
      data: {
        userId: userRecord.uid,
        email,
        role: userData.role || "user",
        customToken,
        emailVerified: isEmailVerified
      }
    };
  } catch (error) {
    if (isFirebaseError(error)) {
      if (error.code === "auth/user-not-found") {
        return { success: false, message: "Invalid email or password" };
      }

      return { success: false, message: firebaseError(error) };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected login error. Please try again."
    };
  }
}
