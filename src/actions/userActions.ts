"use server";

import { auth, signIn } from "@/auth";
import { adminAuth, adminDb } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

// Helper function to convert Firestore Timestamp to ISO string
function convertTimestamps(obj: any): any {
  if (obj instanceof Timestamp) {
    return obj.toDate().toISOString();
  } else if (Array.isArray(obj)) {
    return obj.map(convertTimestamps);
  } else if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, convertTimestamps(value)]));
  }
  return obj;
}

export async function updateProfile(formData: FormData) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const photoURL = formData.get("picture") as string;

  try {
    // Prepare the update object for Firebase Auth
    const authUpdate: { displayName?: string; photoURL?: string } = {};
    if (name) authUpdate.displayName = name;
    if (photoURL) authUpdate.photoURL = photoURL;

    // Only update Firebase Auth if there are changes
    if (Object.keys(authUpdate).length > 0) {
      await adminAuth.updateUser(session.user.id, authUpdate);
    }

    // Prepare the update object for Firestore
    const firestoreUpdate: { name?: string; picture?: string; updatedAt: Timestamp } = {
      updatedAt: Timestamp.now()
    };
    if (name) firestoreUpdate.name = name;
    if (photoURL) firestoreUpdate.picture = photoURL;

    // Update Firestore
    await adminDb.collection("users").doc(session.user.id).update(firestoreUpdate);

    // After successful update, force a session update
    await signIn("credentials", {
      redirect: false,
      email: session.user.email,
      password: "dummy" // We're not actually signing in, just refreshing the session
    });

    // Fetch the updated user profile
    const updatedUser = await adminAuth.getUser(session.user.id);
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.data();

    return {
      success: true,
      user: convertTimestamps({
        id: updatedUser.uid,
        name: updatedUser.displayName,
        email: updatedUser.email,
        picture: updatedUser.photoURL,
        ...userData
      })
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function getProfile() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const user = await adminAuth.getUser(session.user.id);
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.data();

    return {
      success: true,
      user: convertTimestamps({
        id: user.uid,
        name: user.displayName,
        email: user.email,
        picture: user.photoURL,
        ...userData // Include any additional fields from Firestore
      })
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, error: "Failed to fetch profile" };
  }
}
