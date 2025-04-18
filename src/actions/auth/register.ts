"use server";

import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
// Updated serverTimestamp import from the new date helper:
import { serverTimestamp } from "@/utils/date-server";
import { logActivity } from "@/firebase/actions";
import { registerSchema } from "@/schemas";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { hashPassword } from "@/utils/hashPassword";
import type { RegisterResponse } from "@/types/auth/register";

export async function registerUser(prevState: RegisterResponse | null, formData: FormData): Promise<RegisterResponse> {
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
      error: errorMessage
    };
  }

  try {
    const passwordHash = await hashPassword(password);

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
          error: msg
        };
      }

      const message = isFirebaseError(error) ? firebaseError(error) : "Failed to create user";
      return {
        success: false,
        message,
        error: message
      };
    }

    const usersSnapshot = await adminDb.collection("users").count().get();
    const isFirstUser = usersSnapshot.data().count === 0;
    const role = isFirstUser ? "admin" : "user";

    if (isFirstUser) {
      await adminAuth.setCustomUserClaims(userRecord.uid, { role: "admin" });
    }

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

    try {
      await logActivity({
        userId: userRecord.uid,
        type: "register",
        description: "Account created, email verification required",
        status: "success"
      });
    } catch (logError) {
      console.error("Failed to log registration activity:", logError);
    }

    return {
      success: true,
      message: "Registration successful! Please verify your email.",
      data: {
        userId: userRecord.uid,
        email,
        role,
        requiresVerification: true,
        password
      }
    };
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const message = isFirebaseError(error) ? firebaseError(error) : "Registration failed";

    return {
      success: false,
      message: "An error occurred during registration. Please try again.",
      error: message
    };
  }
}
