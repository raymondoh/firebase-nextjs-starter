"use server";

import bcryptjs from "bcryptjs";
import { cookies } from "next/headers";
import { auth, signIn } from "@/auth";
import { adminAuth, adminDb } from "@/firebase/admin";
import { loginSchema } from "@/schemas/auth";
import type { LoginState } from "@/types/auth";
import { logActivity } from "@/firebase/activity";

// Functions: loginUser, logoutUser
// These functions are used to log users in and out.
// The loginUser function is used to log a user in using their email and password.
// The logoutUser function is used to log a user out.

// LOGIN
export async function loginUser(prevState: LoginState, formData: FormData): Promise<LoginState> {
  console.log("loginUser action called with formData:", formData ? "exists" : "null");

  // Validate form data
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!result.success) {
    console.log("Login validation failed:", result.error);
    return {
      success: false,
      message: "Invalid email or password format"
    };
  }

  const { email, password } = result.data;
  console.log("Login attempt for email:", email);

  try {
    console.log("Attempting to sign in with credentials:", { email });

    // First, let's verify the password directly before attempting to sign in
    try {
      // Get user from Firebase Auth
      const userRecord = await adminAuth.getUserByEmail(email);

      // Get user data from Firestore
      const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
      const userData = userDoc.data();

      if (!userData || !userData.passwordHash) {
        return {
          success: false,
          message: "Invalid email or password"
        };
      }

      // Verify the password using bcrypt
      const isPasswordValid = await bcryptjs.compare(password, userData.passwordHash);

      if (!isPasswordValid) {
        console.log("Password verification failed for user:", userRecord.uid);
        return {
          success: false,
          message: "Invalid email or password"
        };
      }

      console.log("Password verified successfully, proceeding with sign in");
    } catch (verifyError: any) {
      console.error("Error verifying password:", verifyError);

      // Handle user not found error
      if (verifyError.code === "auth/user-not-found") {
        return {
          success: false,
          message: "Invalid email or password"
        };
      }

      return {
        success: false,
        message: "An error occurred during authentication"
      };
    }

    // If we get here, the password is valid, so attempt to sign in
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        isRegistration: "false"
      });

      if (result?.error) {
        console.error("SignIn returned error:", result.error);
        return {
          success: false,
          message: "Authentication failed"
        };
      }
    } catch (signInError: any) {
      console.error("Error during signIn:", signInError);
      return {
        success: false,
        message: "Authentication failed"
      };
    }

    // Check if the auth cookie was set
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("next-auth.session-token");

    console.log("After signIn, session token cookie:", sessionToken ? "exists" : "missing");

    if (!sessionToken) {
      console.log("Login successful, session token exists");
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

    // Return a user-friendly error message
    return {
      success: false,
      message: error.message || "An unexpected error occurred"
    };
  }
}

// LOGOUT
export async function logoutUser(): Promise<{ success: boolean; message?: string }> {
  try {
    // Get the current session
    const session = await auth();

    if (session?.user?.id) {
      // Log the logout activity
      await logActivity({
        userId: session.user.id,
        type: "login", // You might want to create a "logout" type
        description: "User logged out",
        status: "success"
      });
    }

    // Perform any additional server-side cleanup here if needed

    // Return success
    return {
      success: true,
      message: "Logged out successfully"
    };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      message: "An error occurred during logout"
    };
  }
}
