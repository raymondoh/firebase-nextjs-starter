// //src/actions/auth/debug.ts
// "use server";

// import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
// import bcryptjs from "bcryptjs";
// import { auth } from "@/auth";
// import { UserRecord } from "firebase-admin/auth";
// import { DocumentSnapshot } from "firebase-admin/firestore";
// import { firebaseError, isFirebaseError } from "@/utils/firebase-error";

// export async function debugPasswordVerification(email: string, password: string) {
//   if (process.env.NODE_ENV === "production") {
//     return { success: false, message: "This debug function is not available in production." };
//   }

//   const session = await auth();

//   if (session?.user?.role !== "admin") {
//     return { success: false, message: "Unauthorized access." };
//   }

//   try {
//     const userRecord: UserRecord = await adminAuth.getUserByEmail(email);
//     const userDoc: DocumentSnapshot = await adminDb.collection("users").doc(userRecord.uid).get();
//     const userData = userDoc.data() as { passwordHash?: string } | undefined;

//     if (!userData?.passwordHash) {
//       return { success: false, message: "No password hash found for this user." };
//     }

//     const isPasswordValid = await bcryptjs.compare(password, userData.passwordHash);

//     return {
//       success: true,
//       isPasswordValid,
//       message: isPasswordValid ? "Password verification successful." : "Incorrect password."
//     };
//   } catch (error) {
//     let message = "An unexpected error occurred.";
//     if (isFirebaseError(error)) {
//       message = firebaseError(error);
//     } else if (error instanceof Error) {
//       message = error.message;
//     }

//     console.error("[debugPasswordVerification] Error:", error);

//     return {
//       success: false,
//       message
//     };
//   }
// }
"use server";

// ================= Imports =================
import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { auth } from "@/auth";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import bcryptjs from "bcryptjs";
import type { UserRecord } from "firebase-admin/auth";
import type { DocumentSnapshot } from "firebase-admin/firestore";

// ================= Debug: Password Verification =================

/**
 * Debug utility to manually verify a password against a user's hashed password.
 * - Only available in development.
 * - Only accessible to admins.
 */
export async function debugPasswordVerification(email: string, password: string) {
  // Disallow in production
  if (process.env.NODE_ENV === "production") {
    return { success: false, message: "This debug function is not available in production." };
  }

  // Require admin session
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { success: false, message: "Unauthorized access." };
  }

  try {
    // Fetch user record
    const userRecord: UserRecord = await adminAuth.getUserByEmail(email);

    // Fetch corresponding Firestore document
    const userDoc: DocumentSnapshot = await adminDb.collection("users").doc(userRecord.uid).get();
    const userData = userDoc.data() as { passwordHash?: string } | undefined;

    if (!userData?.passwordHash) {
      return { success: false, message: "No password hash found for this user." };
    }

    // Compare password
    const isPasswordValid = await bcryptjs.compare(password, userData.passwordHash);

    return {
      success: true,
      isPasswordValid,
      message: isPasswordValid ? "Password verification successful." : "Incorrect password."
    };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unexpected error verifying password.";

    console.error("[debugPasswordVerification] Error:", message);

    return { success: false, message };
  }
}
