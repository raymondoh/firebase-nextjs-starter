"use server";
import { loginSchema } from "@/schemas/auth";
import { adminAuth, adminDb } from "@/firebase/admin";
import { logActivity } from "@/firebase/utils/activity";
import bcryptjs from "bcryptjs";

// Define the LoginState type
export interface LoginState {
  success?: boolean;
  message?: string;
  error?: string;
  userId?: string;
  email?: string;
  role?: string;
  customToken?: string;
}

export async function loginUser(prevState: LoginState | null, formData: FormData): Promise<LoginState> {
  console.log("loginUser action called with formData:", formData ? "exists" : "null");

  // Extract form data
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const isRegistration = formData.get("isRegistration") === "true";

  console.log("Login attempt for email:", email);

  // Validate using the schema
  const validationResult = loginSchema.safeParse({ email, password });
  if (!validationResult.success) {
    const errorMessage = validationResult.error.issues[0]?.message || "Invalid form data";
    return {
      success: false,
      message: errorMessage
    };
  }

  try {
    console.log("Attempting to sign in with credentials:", { email });

    // First, verify the credentials against Firebase Auth
    try {
      // Get the user from Firebase Auth
      const userRecord = await adminAuth.getUserByEmail(email);
      console.log("Found user in Firebase Auth:", userRecord.uid);

      // Get user data from Firestore
      const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
      const userData = userDoc.data();

      if (!userData) {
        console.error("User data not found in Firestore for user:", userRecord.uid);
        return {
          success: false,
          message: "User data not found"
        };
      }

      // Check if passwordHash exists in user data
      if (!userData.passwordHash) {
        console.warn("No password hash found for user:", userRecord.uid);
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

      // Now we need to get a Firebase ID token to use with NextAuth
      // Create a custom token
      console.log("Creating custom token for user:", userRecord.uid);
      const customToken = await adminAuth.createCustomToken(userRecord.uid);
      console.log("Custom token created successfully");

      // Log the activity
      await logActivity({
        userId: userRecord.uid,
        type: "login",
        description: "Logged in with email/password",
        status: "success"
      });

      // Return success with user info and the custom token
      console.log("Returning success with custom token");
      return {
        success: true,
        message: "Login successful!",
        userId: userRecord.uid,
        email: email,
        role: userData.role || "user",
        customToken: customToken
      };
    } catch (error: any) {
      console.error("Error during Firebase authentication:", error);

      if (error.code === "auth/user-not-found") {
        return {
          success: false,
          message: "Invalid email or password"
        };
      }

      return {
        success: false,
        message: `Authentication failed: ${error.message}`
      };
    }
  } catch (error) {
    console.error("Error during login:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again."
    };
  }
}
