"use server";

import { adminAuth, adminDb } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { logActivity } from "@/firebase/utils/activity";
import type { AuthActionResponse } from "@/types/auth/common";

/**
 * Handles Google authentication (both sign-in and sign-up)
 * This function is called after a successful Google OAuth flow
 */
export async function handleGoogleAuth(userInfo: {
  email: string;
  name?: string;
  picture?: string;
  sub: string; // Google's unique ID
}): Promise<AuthActionResponse> {
  console.log("handleGoogleAuth called with user info:", {
    email: userInfo.email,
    name: userInfo.name,
    hasPicture: !!userInfo.picture,
    sub: userInfo.sub
  });

  try {
    // Check if user already exists in Firebase by email
    let firebaseUser;
    let isNewUser = false;

    try {
      // Try to get the user by email
      firebaseUser = await adminAuth.getUserByEmail(userInfo.email);
      console.log("User already exists in Firebase:", firebaseUser.uid);
    } catch (error) {
      // User doesn't exist, create a new one
      console.log("User doesn't exist in Firebase, creating new user");
      isNewUser = true;

      // Create the user in Firebase Auth
      firebaseUser = await adminAuth.createUser({
        email: userInfo.email,
        displayName: userInfo.name || userInfo.email.split("@")[0],
        photoURL: userInfo.picture,
        emailVerified: true // Google accounts are already verified
      });
      console.log("Created new Firebase user:", firebaseUser.uid);
    }

    // Check if this is the first user in the system (to assign admin role)
    const usersSnapshot = await adminDb.collection("users").count().get();
    const isFirstUser = usersSnapshot.data().count === 0;
    const role = isFirstUser ? "admin" : "user";

    if (isNewUser) {
      // Create user document in Firestore for new users
      const now = new Date();
      await adminDb
        .collection("users")
        .doc(firebaseUser.uid)
        .set({
          email: userInfo.email,
          name: userInfo.name || userInfo.email.split("@")[0],
          photoURL: userInfo.picture || null,
          role: role,
          provider: "google",
          googleId: userInfo.sub,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now
        });

      // Set custom claims for the user
      await adminAuth.setCustomUserClaims(firebaseUser.uid, { role: role });
      console.log("Custom claims set for user");
    } else {
      // Update existing user's information
      await adminDb
        .collection("users")
        .doc(firebaseUser.uid)
        .update({
          lastLoginAt: new Date(),
          updatedAt: new Date(),
          // Only update these if they don't exist or are empty
          name: FieldValue.increment(0),
          photoURL: FieldValue.increment(0),
          provider: "google",
          googleId: userInfo.sub
        });

      // Use a transaction to conditionally update fields only if they're empty
      await adminDb.runTransaction(async transaction => {
        const userDoc = await transaction.get(adminDb.collection("users").doc(firebaseUser.uid));
        const userData = userDoc.data();

        const updates: Record<string, any> = {};

        if (!userData?.name && userInfo.name) {
          updates.name = userInfo.name;
        }

        if (!userData?.photoURL && userInfo.picture) {
          updates.photoURL = userInfo.picture;
        }

        if (Object.keys(updates).length > 0) {
          transaction.update(adminDb.collection("users").doc(firebaseUser.uid), updates);
        }
      });
    }

    // Log the activity
    await logActivity({
      userId: firebaseUser.uid,
      type: isNewUser ? "register" : "login",
      description: `${isNewUser ? "Account created" : "Logged in"} with Google`,
      status: "success",
      metadata: {
        provider: "google",
        email: userInfo.email
      }
    });

    return {
      success: true,
      message: isNewUser ? "Google account created successfully" : "Google login successful",
      userId: firebaseUser.uid,
      email: userInfo.email,
      role: role
    };
  } catch (error: any) {
    console.error("Google authentication error:", error);
    return {
      success: false,
      message: `Google authentication failed: ${error.message}`
    };
  }
}
