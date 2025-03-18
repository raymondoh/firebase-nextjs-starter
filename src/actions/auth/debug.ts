// /actions/auth/debug.ts
"use server";

//import { adminAuth, adminDb } from "@/firebase";
import * as admin from "@/firebase/admin";
import bcryptjs from "bcryptjs";
import { auth } from "@/auth";

export async function debugPasswordVerification(email: string, password: string) {
  const session = await auth();

  // Only allow admins to use debugging functions
  if (!session?.user?.role || session.user.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    console.error("Debug functions should not be called in production");
    return { success: false, message: "Not available in production" };
  }
  try {
    // Get user from Firebase Auth
    const userRecord = await admin.adminAuth.getUserByEmail(email);
    console.log("User found in Firebase Auth:", userRecord.uid);

    // Get user data from Firestore
    const userDoc = await admin.adminDb.collection("users").doc(userRecord.uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return { success: false, message: "User data not found in Firestore" };
    }

    // Check if passwordHash exists
    if (!userData.passwordHash) {
      return { success: false, message: "No password hash found for user" };
    }

    // Log the stored hash (for debugging only, remove in production)
    console.log("Stored password hash:", userData.passwordHash);

    // Verify the password using bcrypt
    const isPasswordValid = await bcryptjs.compare(password, userData.passwordHash);

    return {
      success: true,
      isPasswordValid,
      message: isPasswordValid ? "Password verification successful" : "Password verification failed"
    };
  } catch (error: any) {
    console.error("Debug error:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred"
    };
  }
}
