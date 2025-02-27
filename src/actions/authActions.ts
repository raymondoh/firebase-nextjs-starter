"use server";

import { auth } from "@/auth";
import { getFirestore } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/firebase/admin";
import { z } from "zod";
import { signIn } from "@/auth";
import { rateLimit } from "@/lib/rateLimit";
import bcryptjs from "bcryptjs";

type UserRole = "admin" | "user";

interface RegisterResult {
  success: boolean;
  message?: string;
  error?: string;
  userId?: string;
  email?: string;
  role?: UserRole;
}
interface RegisterResult {
  success: boolean;
  error?: string;
}
type LoginResult = {
  success: boolean;
  message: string;
  userId?: string;
  role?: UserRole;
};

const registerSchema = z
  .object({
    email: z
      .string()
      .email({ message: "Please enter a valid email address" })
      .max(255, { message: "Email must not exceed 255 characters" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(72, { message: "Password must not exceed 72 characters" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      }),
    confirmPassword: z.string()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
const emailSchema = z.object({
  email: z.string().email()
});
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
});

// registerUser function
export async function registerUser(formData: FormData): Promise<RegisterResult> {
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

    console.log("Creating user in Firebase Auth");
    const userRecord = await adminAuth.createUser({
      email: validatedEmail,
      password: validatedPassword
    });
    console.log("User created in Firebase Auth:", userRecord.uid);

    // Initialize user data in Firestore
    console.log("Initializing user data in Firestore");
    const now = new Date();
    await db.collection("users").doc(userRecord.uid).set({
      email: validatedEmail,
      role: role,
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

// loginUser function
export async function loginUser(formData: FormData): Promise<LoginResult> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!result.success) {
    return { success: false, message: "Invalid email or password format" };
  }

  const { email, password } = result.data;

  try {
    // Attempt to sign in using the server-side signIn function
    const signInResult = await signIn("credentials", {
      redirect: false,
      email,
      password
    });

    if (!signInResult?.ok) {
      return {
        success: false,
        message: "Invalid email or password"
      };
    }

    // If sign-in is successful, get additional user data
    const userRecord = await adminAuth.getUserByEmail(email);

    // Get user role from Firestore
    const db = getFirestore();
    const userDoc = await db.collection("users").doc(userRecord.uid).get();
    const userData = userDoc.data();
    const role = (userData?.role as UserRole) || "user";

    return {
      success: true,
      message: "Login successful",
      userId: userRecord.uid,
      role
    };
  } catch (error: any) {
    console.error("Login error:", error);
    if (error.code === "auth/user-not-found") {
      return { success: false, message: "Invalid email or password" };
    }
    return {
      success: false,
      message: "An unexpected error occurred"
    };
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
