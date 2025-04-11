"use server";

import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import bcryptjs from "bcryptjs";
import { auth } from "@/auth";
import { UserRecord } from "firebase-admin/auth";
import { DocumentSnapshot } from "firebase-admin/firestore";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";

export async function debugPasswordVerification(email: string, password: string) {
  if (process.env.NODE_ENV === "production") {
    console.error("Debug functions should not be called in production");
    return { success: false, message: "Not available in production" };
  }

  const session = await auth();

  if (!session?.user?.role || session.user.role !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const userRecord: UserRecord = await adminAuth.getUserByEmail(email);
    const userDoc: DocumentSnapshot = await adminDb.collection("users").doc(userRecord.uid).get();
    const userData = userDoc.data() as { passwordHash?: string } | undefined;

    if (!userData?.passwordHash) {
      return { success: false, message: "No password hash found for user" };
    }

    const isPasswordValid = await bcryptjs.compare(password, userData.passwordHash);

    return {
      success: true,
      isPasswordValid,
      message: isPasswordValid ? "Password verification successful" : "Password verification failed"
    };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unexpected error occurred";

    console.error("Debug error:", error);

    return {
      success: false,
      message
    };
  }
}
