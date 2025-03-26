"use server";

import { adminAuth, adminDb } from "@/firebase/admin";
import { serverTimestamp, increment } from "@/firebase/admin/firestore";
import { logActivity } from "@/firebase";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error"; // ✅
import type { AuthActionResponse } from "@/types/auth/common";
import { UserRecord } from "firebase-admin/auth";

export async function handleGoogleAuth(userInfo: {
  email: string;
  name?: string;
  picture?: string;
  sub: string;
}): Promise<AuthActionResponse> {
  console.log("handleGoogleAuth called with user info:", {
    email: userInfo.email,
    name: userInfo.name,
    hasPicture: !!userInfo.picture,
    sub: userInfo.sub
  });

  try {
    let firebaseUser: UserRecord;
    let isNewUser = false;

    try {
      firebaseUser = await adminAuth.getUserByEmail(userInfo.email);
      console.log("User already exists in Firebase:", firebaseUser.uid);
    } catch (error) {
      console.warn("User not found, creating...");
      console.error("getUserByEmail failed:", error);
      isNewUser = true;

      firebaseUser = await adminAuth.createUser({
        email: userInfo.email,
        displayName: userInfo.name || userInfo.email.split("@")[0],
        photoURL: userInfo.picture,
        emailVerified: true
      });
      console.log("Created new Firebase user:", firebaseUser.uid);
    }

    const usersSnapshot = await adminDb.collection("users").count().get();
    const isFirstUser = usersSnapshot.data().count === 0;
    const role = isFirstUser ? "admin" : "user";

    const userRef = adminDb.collection("users").doc(firebaseUser.uid);

    if (isNewUser) {
      await userRef.set({
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split("@")[0],
        photoURL: userInfo.picture || null,
        role,
        provider: "google",
        googleId: userInfo.sub,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });

      await adminAuth.setCustomUserClaims(firebaseUser.uid, { role });
    } else {
      await userRef.update({
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        name: increment(0),
        photoURL: increment(0),
        provider: "google",
        googleId: userInfo.sub
      });

      await adminDb.runTransaction(async transaction => {
        const userDoc = await transaction.get(userRef);
        const userData = userDoc.data();

        const updates: { name?: string; photoURL?: string } = {};
        if (!userData?.name && userInfo.name) updates.name = userInfo.name;
        if (!userData?.photoURL && userInfo.picture) updates.photoURL = userInfo.picture;

        if (Object.keys(updates).length > 0) {
          transaction.update(userRef, updates);
        }
      });
    }

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
      role
    };
  } catch (error: unknown) {
    console.error("Google authentication error:", error);

    const errorMessage = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? `Google authentication failed: ${error.message}`
      : "Google authentication failed: An unexpected error occurred";

    return {
      success: false,
      message: errorMessage
    };
  }
}
