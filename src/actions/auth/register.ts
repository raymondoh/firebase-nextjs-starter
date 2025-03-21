// src/actions/auth/register
"use server";

import bcryptjs from "bcryptjs";
import { adminAuth, adminDb } from "@/firebase/admin";
import { logActivity } from "@/firebase/actions";
import { registerSchema } from "@/schemas";
import type { RegisterState } from "@/types";

// REGISTRATION
export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  console.log("registerUser server action called", {
    formDataExists: formData ? true : false,
    prevState
  });

  // Extract form data
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  console.log("Form data extracted", {
    nameExists: !!name,
    emailExists: !!email,
    passwordExists: !!password,
    confirmPasswordExists: !!confirmPassword
  });

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
      message: errorMessage,
      error: errorMessage,
      requiresVerification: false,
      password: ""
    };
  }

  try {
    console.log("Creating user in Firebase Auth");
    // Hash the password
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Create the user in Firebase Auth
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: name || email.split("@")[0], // Use email username as fallback
        emailVerified: false // Set to false initially for verification
      });
      console.log("User created in Firebase Auth:", userRecord.uid);
    } catch (error: any) {
      console.error("Error creating user in Firebase Auth:", error);
      if (error.code === "auth/email-already-exists") {
        return {
          success: false,
          message: "Email already in use. Please try logging in instead.",
          error: "Email already in use. Please try logging in instead.",
          requiresVerification: false,
          password: ""
        };
      }
      throw error;
    }

    // Check if this is the first user in the system (to assign admin role)
    console.log("Checking if this is the first user in the system");
    const usersSnapshot = await adminDb.collection("users").count().get();
    const isFirstUser = usersSnapshot.data().count === 0;
    const role = isFirstUser ? "admin" : "user";
    console.log(`User role determined: ${role} (isFirstUser: ${isFirstUser})`);

    // If this is the first user, set custom claims
    if (isFirstUser) {
      await adminAuth.setCustomUserClaims(userRecord.uid, { role: "admin" });
      console.log("Set admin custom claims for first user");
    }

    console.log("Creating user document in Firestore");
    // Create user document in Firestore with the hashed password
    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set({
        name: name || email.split("@")[0], // Use email username as fallback
        email,
        role, // Use the determined role instead of hardcoding "user"
        passwordHash, // Store the hashed password
        emailVerified: false, // Track email verification status
        createdAt: new Date()
      });
    console.log("User document created in Firestore");

    // Log activity
    await logActivity({
      userId: userRecord.uid,
      type: "register",
      description: "Account created, email verification required",
      status: "success"
    });
    console.log("Activity logged");

    // Return the user ID, email, and role along with success message
    return {
      success: true,
      message: "Registration successful! Please verify your email.",
      userId: userRecord.uid,
      email: email,
      role: role,
      requiresVerification: true, // Add this flag to indicate verification is needed
      password: password // Include password for client-side verification (will be used only for sending verification email)
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "An error occurred during registration. Please try again.",
      error: "An error occurred during registration. Please try again.",
      requiresVerification: false,
      password: ""
    };
  }
}
