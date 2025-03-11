"use server";

import bcryptjs from "bcryptjs";
import { adminAuth, adminDb } from "@/firebase/admin";
import { registerSchema } from "@/schemas/auth";
import type { RegisterState } from "@/types/auth";
import { logActivity } from "@/firebase/activity";

// Functions: registerUser
// The registerUser function is used to register a new user account.
// It creates a new user in Firebase Auth and a user document in Firestore.

// REGISTRATION
export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  // Extract form data
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate using the schema
  const validationResult = registerSchema.safeParse({
    email,
    password,
    confirmPassword
  });

  if (!validationResult.success) {
    // Extract the first error message
    const errorMessage = validationResult.error.issues[0]?.message || "Invalid form data";
    return {
      success: false,
      message: errorMessage
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
        displayName: name || email.split("@")[0] // Use email username as fallback
      });
    } catch (error: any) {
      if (error.code === "auth/email-already-exists") {
        return {
          success: false,
          message: "Email already in use. Please try logging in instead."
        };
      }
      throw error;
    }

    // Create user document in Firestore with the hashed password
    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set({
        name: name || email.split("@")[0], // Use email username as fallback
        email,
        role: "user",
        passwordHash, // Store the hashed password
        createdAt: new Date()
      });

    // Log activity
    await logActivity({
      userId: userRecord.uid,
      type: "login",
      description: "Account created",
      status: "success"
    });

    // Return the user ID, email, and role along with success message
    return {
      success: true,
      message: "Registration successful!",
      userId: userRecord.uid,
      email: email,
      role: "user"
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "An error occurred during registration. Please try again."
    };
  }
}
