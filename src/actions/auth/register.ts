"use server";

import bcryptjs from "bcryptjs";
import { adminAuth, adminDb } from "@/firebase/admin";
import { serverTimestamp } from "@/firebase/admin/firestore";
import { logActivity } from "@/firebase/actions";
import { registerSchema } from "@/schemas";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import type { RegisterState } from "@/types";

// REGISTRATION
export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const validationResult = registerSchema.safeParse({ email, password, confirmPassword });
  if (!validationResult.success) {
    const errorMessage = validationResult.error.issues[0]?.message || "Invalid form data";
    return {
      success: false,
      message: errorMessage,
      error: errorMessage,
      requiresVerification: false,
      password: ""
    };
  }

  try {
    // Hash the password
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Create the user in Firebase Auth
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: name || email.split("@")[0],
        emailVerified: false
      });
    } catch (error: unknown) {
      if (isFirebaseError(error) && error.code === "auth/email-already-exists") {
        const msg = "Email already in use. Please try logging in instead.";
        return {
          success: false,
          message: msg,
          error: msg,
          requiresVerification: false,
          password: ""
        };
      }

      return {
        success: false,
        message: isFirebaseError(error) ? firebaseError(error) : "Failed to create user",
        error: isFirebaseError(error) ? firebaseError(error) : "Failed to create user",
        requiresVerification: false,
        password: ""
      };
    }

    // Check if this is the first user (to assign admin role)
    const usersSnapshot = await adminDb.collection("users").count().get();
    const isFirstUser = usersSnapshot.data().count === 0;
    const role = isFirstUser ? "admin" : "user";

    if (isFirstUser) {
      await adminAuth.setCustomUserClaims(userRecord.uid, { role: "admin" });
    }

    // Create user document in Firestore
    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set({
        name: name || email.split("@")[0],
        email,
        role,
        passwordHash,
        emailVerified: false,
        createdAt: serverTimestamp()
      });
    // ✅ Registration activity is logged here and should not be duplicated elsewhere.

    // Log activity
    await logActivity({
      userId: userRecord.uid,
      type: "register",
      description: "Account created, email verification required",
      status: "success"
    });

    return {
      success: true,
      message: "Registration successful! Please verify your email.",
      userId: userRecord.uid,
      email,
      role,
      requiresVerification: true,
      password // For client-side use only (sending verification email)
    };
  } catch (error: unknown) {
    console.error("Registration error:", error);

    return {
      success: false,
      message: "An error occurred during registration. Please try again.",
      error: isFirebaseError(error) ? firebaseError(error) : "Registration failed",
      requiresVerification: false,
      password: ""
    };
  }
}
