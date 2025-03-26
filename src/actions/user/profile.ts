"use server";

import { auth } from "@/auth";
import { adminAuth, adminDb } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { profileUpdateSchema } from "@/schemas/user";
import { convertTimestamps } from "@/firebase/utils/firestore";
import { logActivity } from "@/firebase";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error"; // ✅ added

import type { ProfileUpdateState } from "@/types/user/profile";
import type { User } from "@/types/user/common";

// Get user profile
export async function getProfile(): Promise<ProfileUpdateState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const user = await adminAuth.getUser(session.user.id);
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.data();

    if (!userData) {
      return { success: false, error: "User data not found" };
    }

    return {
      success: true,
      user: convertTimestamps({
        id: user.uid,
        name: user.displayName || userData.name,
        email: user.email,
        bio: userData.bio || "",
        image: user.photoURL || userData.picture,
        role: userData.role || "user",
        ...userData
      }) as User
    };
  } catch (error) {
    console.error("Error getting profile:", error);
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to get profile";
    return { success: false, error: message };
  }
}

// Update user profile
export async function updateUserProfile(
  prevState: ProfileUpdateState,
  formData: FormData
): Promise<ProfileUpdateState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const imageUrl = formData.get("imageUrl") as string | null;

    console.log("Updating profile with:", { name, bio, imageUrl: imageUrl ? "exists" : "none" });

    const result = profileUpdateSchema.safeParse({ name, bio });
    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message || "Invalid form data";
      return { success: false, error: errorMessage };
    }

    const authUpdate: { displayName?: string; photoURL?: string } = {};
    if (name) authUpdate.displayName = name;
    if (imageUrl) authUpdate.photoURL = imageUrl;

    if (Object.keys(authUpdate).length > 0) {
      try {
        await adminAuth.updateUser(session.user.id, authUpdate);
      } catch (error) {
        console.error("Error updating Firebase Auth:", error);
        const message = isFirebaseError(error)
          ? firebaseError(error)
          : "Failed to update profile in authentication system";
        return { success: false, error: message };
      }
    }

    const firestoreUpdate: {
      name?: string;
      bio?: string;
      picture?: string;
      updatedAt: Timestamp;
    } = {
      updatedAt: Timestamp.now()
    };

    if (name) firestoreUpdate.name = name;
    if (bio !== undefined) firestoreUpdate.bio = bio;
    if (imageUrl) firestoreUpdate.picture = imageUrl;

    try {
      await adminDb.collection("users").doc(session.user.id).update(firestoreUpdate);
    } catch (error) {
      console.error("Error updating Firestore:", error);
      const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update profile in database";
      return { success: false, error: message };
    }

    // ✅ Log the update
    await logActivity({
      userId: session.user.id,
      type: "profile_update",
      description: "Profile information updated",
      status: "success"
    });

    const updatedUser = await adminAuth.getUser(session.user.id);
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.data();

    return {
      success: true,
      user: convertTimestamps({
        id: updatedUser.uid,
        name: updatedUser.displayName || userData?.name,
        email: updatedUser.email,
        bio: userData?.bio || "",
        image: updatedUser.photoURL || userData?.picture,
        role: userData?.role || "user",
        ...userData
      }) as User
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update profile";
    return { success: false, error: message };
  }
}
