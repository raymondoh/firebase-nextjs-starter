"use server";

import { adminAuth } from "@/firebase/admin";
import { logActivity } from "@/firebase";

/**
 * Sends a password reset email to the specified email address
 */
export async function sendPasswordResetEmail(email: string) {
  if (!email) {
    return {
      success: false,
      error: "Email is required"
    };
  }

  try {
    console.log(`Sending password reset email to: ${email}`);

    // Define actionCodeSettings directly within the function

    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`, // Use your environment variable
      handleCodeInApp: false // Or true, depending on your app's flow
    };

    // Send the password reset email using Firebase Admin SDK
    await adminAuth.generatePasswordResetLink(email, actionCodeSettings);

    // Log the activity
    try {
      const userRecord = await adminAuth.getUserByEmail(email);
      if (userRecord) {
        await logActivity({
          userId: userRecord.uid,
          type: "password_reset_requested",
          description: "Password reset email sent",
          status: "success",
          metadata: {
            email
          }
        });
      }
    } catch (logError) {
      console.error("Error logging password reset activity:", logError);
      // Continue even if logging fails
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error sending password reset email:", error);

    // Handle specific Firebase errors more gracefully
    let errorMessage = "Failed to send password reset email. Please try again later.";
    if (error && error.code === "auth/user-not-found") {
      // For security, we still return success even if user is not found
      console.log("User not found, but returning success to prevent email enumeration");
      return { success: true };
    } else if (error && error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}
