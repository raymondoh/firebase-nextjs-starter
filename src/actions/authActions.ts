"use server";
import bcryptjs from "bcryptjs";
import { cookies } from "next/headers"; // Add this import
import { rateLimit } from "@/lib/rateLimit";
import { auth, signIn } from "@/auth";
import { getFirestore } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/firebase/admin";
import { loginSchema, registerSchema } from "@/schemas/auth";

import { z } from "zod";

// LOGIN
type UserRole = "admin" | "user";

type LoginState = {
  success: boolean;
  message?: string;
  error?: string;
  userId?: string;
  role?: UserRole;
} | null;

type RegisterState = {
  success: boolean;
  error?: string;
  userId?: string;
  email?: string;
  role?: UserRole;
} | null;

// Login User
export async function loginUser(prevState: LoginState, formData: FormData): Promise<LoginState> {
  // Validate form data
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!result.success) {
    return {
      success: false,
      message: "Invalid email or password format"
    };
  }

  const { email, password } = result.data;

  try {
    console.log("Attempting to sign in with credentials:", { email });

    // Try to sign in
    await signIn("credentials", {
      redirect: false,
      email,
      password
    });

    // Check if the auth cookie was set
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("next-auth.session-token");

    console.log("After signIn, session token cookie:", sessionToken ? "exists" : "missing");

    if (!sessionToken) {
      return {
        success: false,
        message: "Authentication failed - no session created"
      };
    }

    // If we get here, the sign-in was successful
    return {
      success: true,
      message: "Login successful"
    };
  } catch (error: any) {
    console.error("Login error:", error);

    // Return a user-friendly error message based on the error type
    return {
      success: false,
      message:
        error.type === "CallbackRouteError"
          ? "Invalid email or password"
          : error.message || "An unexpected error occurred"
    };
  }
}

// Register User
export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  console.log("Starting registerUser function");

  // Log all form data
  console.log("Form data received:", Object.fromEntries(formData));

  try {
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    console.log("Email:", email);
    console.log("Password:", password ? "******" : "null or empty");
    console.log("Confirm Password:", confirmPassword ? "******" : "null or empty");

    if (!email || !password || !confirmPassword) {
      console.log("Missing required fields");
      return { success: false, error: "All fields are required" };
    }

    const result = registerSchema.safeParse({
      email,
      password,
      confirmPassword
    });

    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => issue.message);
      console.log("Validation errors:", errorMessages);
      return { success: false, error: errorMessages.join(", ") };
    }

    const { email: validatedEmail, password: validatedPassword } = result.data;

    const db = getFirestore();

    console.log("Checking if this is the first user");
    const usersSnapshot = await db.collection("users").count().get();
    const isFirstUser = usersSnapshot.data().count === 0;
    console.log("Is first user:", isFirstUser);

    const role = isFirstUser ? "admin" : "user";

    // Hash the password before storing it
    console.log("Hashing password");
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(validatedPassword, salt);

    console.log("Creating user in Firebase Auth");
    const userRecord = await adminAuth.createUser({
      email: validatedEmail,
      password: validatedPassword // Firebase Auth still needs the original password
    });
    console.log("User created in Firebase Auth:", userRecord.uid);

    // Initialize user data in Firestore with the hashed password
    console.log("Initializing user data in Firestore");
    const now = new Date();
    await db.collection("users").doc(userRecord.uid).set({
      email: validatedEmail,
      role: role,
      passwordHash: hashedPassword, // Store the hashed password
      createdAt: now,
      updatedAt: now
    });
    console.log("User data saved in Firestore");

    // Set custom claims for the user
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: role });
    console.log("Custom claims set for user");

    console.log("Registration successful");
    return {
      success: true,
      userId: userRecord.uid,
      email: validatedEmail,
      role: role
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    console.error("Error stack:", error.stack);
    return { success: false, error: error.message || "Registration failed" };
  }
}

export async function requestPasswordReset(formData: FormData) {
  const result = forgotPasswordSchema.safeParse({
    email: formData.get("email")
  });

  if (!result.success) {
    console.error("Invalid email format:", result.error);
    return { success: false, error: "Invalid email format" };
  }

  const { email } = result.data;

  try {
    console.log("Attempting to generate password reset link for:", email);
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/login`, // Redirect to login page after reset
      handleCodeInApp: false
    };
    console.log("Action code settings:", actionCodeSettings);

    const resetLink = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
    console.log("Password reset link generated:", resetLink);

    // Note: In a production environment, you wouldn't log the actual reset link
    // This is just for debugging purposes

    return { success: true };
  } catch (error: any) {
    console.error("Password reset error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    if (error.code === "auth/user-not-found") {
      // For security reasons, we don't want to reveal if the email exists or not
      return { success: true }; // Pretend it succeeded even if the user doesn't exist
    }
    return { success: false, error: "Failed to send password reset email" };
  }
}
// Add a new function to update password
export async function updatePassword(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Not authenticated" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "All fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New passwords do not match" };
  }

  try {
    // Get user data from Firestore to check current password
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.data();

    if (!userData || !userData.passwordHash) {
      return { success: false, error: "User data not found" };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, userData.passwordHash);
    if (!isCurrentPasswordValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const newPasswordHash = await bcryptjs.hash(newPassword, salt);

    // Update password in Firebase Auth
    await adminAuth.updateUser(session.user.id, {
      password: newPassword
    });

    // Update password hash in Firestore
    await adminDb.collection("users").doc(session.user.id).update({
      passwordHash: newPasswordHash,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating password:", error);
    return { success: false, error: error.message || "Failed to update password" };
  }
}

// Add a function to handle password reset completion
export async function completePasswordReset(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const oobCode = formData.get("oobCode") as string;
  const newPassword = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!oobCode || !newPassword || !confirmPassword) {
    return { success: false, error: "All fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  try {
    // Verify the action code
    const info = await adminAuth.verifyPasswordResetCode(oobCode);

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Update the password in Firebase Auth
    await adminAuth.confirmPasswordReset(oobCode, newPassword);

    // Update the password hash in Firestore
    const userRecord = await adminAuth.getUserByEmail(info.email);
    await adminDb.collection("users").doc(userRecord.uid).update({
      passwordHash: hashedPassword,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error completing password reset:", error);
    return { success: false, error: error.message || "Failed to reset password" };
  }
}
