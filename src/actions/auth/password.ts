"use server";

import bcryptjs from "bcryptjs";
import { auth } from "@/auth";
//import { adminAuth, adminDb } from "@/firebase";
import * as admin from "@/firebase/admin";
import { logActivity } from "@/firebase";
import { forgotPasswordSchema, updatePasswordSchema } from "@/schemas/auth";
import type { ForgotPasswordState, UpdatePasswordState } from "@/types/auth/password";

// FORGOT PASSWORD (Request Reset)
// export async function requestPasswordReset(
//   prevState: ForgotPasswordState,
//   formData: FormData
// ): Promise<ForgotPasswordState> {
//   console.log("requestPasswordReset called with formData:", formData ? "exists" : "null");

//   // Check if formData is null or undefined
//   if (!formData) {
//     console.error("FormData is null or undefined");
//     return { success: false, error: "Invalid form submission" };
//   }

//   const email = formData.get("email");
//   console.log("Email extracted from formData:", email);

//   // Check if email is present and is a string
//   if (!email || typeof email !== "string") {
//     console.error("Email is missing from form data or is not a string");
//     return { success: false, error: "Email is required" };
//   }

//   const result = forgotPasswordSchema.safeParse({
//     email
//   });

//   if (!result.success) {
//     console.error("Invalid email format:", result.error);
//     return { success: false, error: "Invalid email format" };
//   }

//   try {
//     console.log("Attempting to send password reset email for:", email);

//     // Use Firebase Admin SDK to generate a password reset link
//     const actionCodeSettings = {
//       url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
//       //handleCodeInApp: true
//     };
//     await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
//     console.log("Password reset email sent successfully");
//     return { success: true };
//   } catch (error: any) {
//     console.error("Password reset error:", error);
//     console.error("Error code:", error.code);
//     console.error("Error message:", error.message);
//     if (error.code === "auth/user-not-found") {
//       // For security reasons, we don't want to reveal if the email exists or not
//       return { success: true }; // Pretend it succeeded even if the user doesn't exist
//     }
//     return { success: false, error: "Failed to send password reset email" };
//   }
// }
export async function requestPasswordReset(
  prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  console.log("requestPasswordReset called with formData:", formData ? "exists" : "null");

  // Check if formData is null or undefined
  if (!formData) {
    console.error("FormData is null or undefined");
    return { success: false, error: "Invalid form submission" };
  }

  const email = formData.get("email");
  console.log("Email extracted from formData:", email);

  // Check if email is present and is a string
  if (!email || typeof email !== "string") {
    console.error("Email is missing from form data or is not a string");
    return { success: false, error: "Email is required" };
  }

  const result = forgotPasswordSchema.safeParse({
    email
  });

  if (!result.success) {
    console.error("Invalid email format:", result.error);
    return { success: false, error: "Invalid email format" };
  }

  try {
    console.log("Attempting to send password reset email for:", email);

    // Log Firebase Admin initialization status
    console.log("Firebase Admin initialized:", !!admin.adminAuth);

    // Log the reset URL that will be used
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;
    console.log("Reset URL:", resetUrl);
    console.log("APP_URL env variable:", process.env.NEXT_PUBLIC_APP_URL);

    // Log action code settings
    const actionCodeSettings = {
      url: resetUrl
      //handleCodeInApp: true
    };
    console.log("Action code settings:", JSON.stringify(actionCodeSettings));

    // Log before the actual API call
    console.log("Calling adminAuth.generatePasswordResetLink...");

    await admin.adminAuth.generatePasswordResetLink(email, actionCodeSettings);

    console.log("Password reset email sent successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Password reset error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack); // Add stack trace for more context

    // Log Firebase project details (without sensitive info)
    console.log("Firebase project ID:", process.env.FIREBASE_PROJECT_ID);

    if (error.code === "auth/user-not-found") {
      // For security reasons, we don't want to reveal if the email exists or not
      return { success: true }; // Pretend it succeeded even if the user doesn't exist
    }
    return { success: false, error: "Failed to send password reset email" };
  }
}

// Helper function to sync password with Firestore after client-side reset
export async function syncPasswordWithFirestore(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the user record
    const userRecord = await admin.adminAuth.getUserByEmail(email);

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Update Firestore
    await admin.adminDb.collection("users").doc(userRecord.uid).update({
      passwordHash: hashedPassword,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error syncing password with Firestore:", error);
    return { success: false, error: "Failed to sync password" };
  }
}

// UPDATE PASSWORD (For logged-in users)
export async function updatePassword(prevState: UpdatePasswordState, formData: FormData): Promise<UpdatePasswordState> {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Safely get form values
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  // Check if values exist and are strings
  if (!currentPassword || typeof currentPassword !== "string") {
    return { success: false, error: "Current password is required" };
  }

  if (!newPassword || typeof newPassword !== "string") {
    return { success: false, error: "New password is required" };
  }

  if (!confirmPassword || typeof confirmPassword !== "string") {
    return { success: false, error: "Confirm password is required" };
  }

  // Validate the form data
  const result = updatePasswordSchema.safeParse({
    currentPassword,
    newPassword,
    confirmPassword
  });

  if (!result.success) {
    const errorMessage = result.error.issues[0]?.message || "Invalid form data";
    return { success: false, error: errorMessage };
  }

  try {
    // Get user data from Firestore to check current password
    const userDoc = await admin.adminDb.collection("users").doc(session.user.id).get();
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
    await admin.adminAuth.updateUser(session.user.id, {
      password: newPassword
    });

    // Update password hash in Firestore
    await admin.adminDb.collection("users").doc(session.user.id).update({
      passwordHash: newPasswordHash,
      updatedAt: new Date()
    });

    // Log the password change
    await logActivity({
      userId: session.user.id,
      type: "password_change",
      description: "Password changed successfully",
      status: "success"
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating password:", error);

    // Provide user-friendly error messages
    if (error.code === "auth/weak-password") {
      return { success: false, error: "The password is too weak. Please choose a stronger password." };
    }

    return { success: false, error: "Failed to update password. Please try again." };
  }
}
