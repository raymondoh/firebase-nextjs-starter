// src/firebase/admin/auth.ts
import { adminAuth, adminDb } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import bcryptjs from "bcryptjs";
import { logActivity } from "@/firebase/admin/activity";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";

// ================= User  =================

export async function createUserInFirebase({
  email,
  password,
  displayName,
  createdBy,
  role = "user"
}: {
  email: string;
  password?: string;
  displayName?: string;
  createdBy?: string;
  role?: string;
}): Promise<{ success: true; uid: string } | { success: false; error: string }> {
  try {
    if (!password || password.trim() === "") {
      return { success: false, error: "Password is required to create a user." };
    }

    console.log("Creating Firebase user with:", { email, passwordPresent: true, displayName });

    // ✅ 1. Create user in Firebase Auth (hashes password internally)
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName
    });

    const uid = userRecord.uid;
    console.log("User created with UID:", uid);

    // ✅ 2. Mark email as verified
    await adminAuth.updateUser(uid, { emailVerified: true });
    console.log("Email verification flag set to true");

    // ✅ 3. Hash password manually for our custom login flow
    const hashedPassword = await bcryptjs.hash(password, 10);

    // ✅ 4. Add metadata to Firestore
    const now = Timestamp.now();
    await adminDb
      .collection("users")
      .doc(uid)
      .set({
        email,
        name: displayName || email.split("@")[0],
        role,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        provider: "admin-create",
        status: "active",
        emailVerified: true,
        passwordHash: hashedPassword // ✅ Required for custom login!
      });
    console.log("Firestore user document created");

    // ✅ 5. Log admin action
    if (createdBy) {
      await logActivity({
        userId: createdBy,
        type: "admin_created_user",
        description: `Created user: ${email}`,
        status: "success",
        metadata: {
          newUserId: uid,
          email
        }
      });
      console.log("Activity log created for admin");
    }

    return { success: true, uid };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error creating user";

    console.error("Error in createUserInFirebase:", message);
    return { success: false, error: message };
  }
}

/**
 * Server-safe function to check if a Firebase user's email is verified.
 */
export async function isEmailVerified(
  userId: string
): Promise<{ success: boolean; verified?: boolean; error?: string }> {
  try {
    const userRecord = await adminAuth.getUser(userId);

    return { success: true, verified: userRecord.emailVerified };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error checking email verification status";

    return { success: false, error: message };
  }
}
