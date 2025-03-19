"use server";

import { auth } from "@/auth";
import { adminAuth, adminDb } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { profileUpdateSchema } from "@/schemas/user";
import type { ProfileUpdateState } from "@/types/user/profile";
import type { User } from "@/types/user/common";
import { convertTimestamps } from "@/actions/utils";

// Functions: getProfile, updateUserProfile
// These functions are used to get and update user profiles.
// The getProfile function fetches the user's profile data from Firebase Auth and Firestore.
// The updateUserProfile function updates the user's profile data in Firebase Auth and Firestore.

// Get user profile
export async function getProfile(): Promise<ProfileUpdateState> {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get user data from Firebase Auth
    const user = await adminAuth.getUser(session.user.id);

    // Get additional user data from Firestore
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.data();

    if (!userData) {
      return { success: false, error: "User data not found" };
    }

    // Return combined user data
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
    return { success: false, error: "Failed to get profile" };
  }
}

// Updated server action to handle profile updates with imageUrl
export async function updateUserProfile(
  prevState: ProfileUpdateState,
  formData: FormData
): Promise<ProfileUpdateState> {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get form data
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const imageUrl = formData.get("imageUrl") as string | null;

    console.log("Updating profile with:", { name, bio, imageUrl: imageUrl ? "exists" : "none" });

    // Validate form data
    const result = profileUpdateSchema.safeParse({
      name,
      bio
    });

    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message || "Invalid form data";
      return { success: false, error: errorMessage };
    }

    // Prepare the update object for Firebase Auth
    const authUpdate: { displayName?: string; photoURL?: string } = {};
    if (name) authUpdate.displayName = name;
    if (imageUrl) authUpdate.photoURL = imageUrl;

    // Only update Firebase Auth if there are changes
    if (Object.keys(authUpdate).length > 0) {
      try {
        console.log("Updating Firebase Auth with:", authUpdate);
        await adminAuth.updateUser(session.user.id, authUpdate);
        console.log("Firebase Auth updated successfully");
      } catch (error) {
        console.error("Error updating Firebase Auth:", error);
        return { success: false, error: "Failed to update profile in authentication system" };
      }
    }

    // Prepare the update object for Firestore
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

    // Update Firestore
    try {
      console.log("Updating Firestore with:", firestoreUpdate);
      await adminDb.collection("users").doc(session.user.id).update(firestoreUpdate);
      console.log("Firestore updated successfully");
    } catch (error) {
      console.error("Error updating Firestore:", error);
      return { success: false, error: "Failed to update profile in database" };
    }

    // Fetch the updated user profile
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
    return { success: false, error: "Failed to update profile" };
  }
}
