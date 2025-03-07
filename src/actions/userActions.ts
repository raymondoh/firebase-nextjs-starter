// actions/userActions.ts
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
    console.log("Updating profile with:", { name, photoURL });

    // Prepare the update object for Firebase Auth
    const authUpdate: { displayName?: string; photoURL?: string } = {};
    if (name) authUpdate.displayName = name;
    if (photoURL) authUpdate.photoURL = photoURL;

    // Only update Firebase Auth if there are changes
    if (Object.keys(authUpdate).length > 0) {
      await adminAuth.updateUser(session.user.id, authUpdate);
      console.log("Firebase Auth updated");
    }

    // Prepare the update object for Firestore
    const firestoreUpdate: { name?: string; picture?: string; updatedAt: Timestamp } = {
      updatedAt: Timestamp.now()
    };

    // IMPORTANT: Make sure we're using the same field names in Firestore as we expect in the session
    if (name) firestoreUpdate.name = name;
    if (photoURL) firestoreUpdate.picture = photoURL;

    // Update Firestore
    await adminDb.collection("users").doc(session.user.id).update(firestoreUpdate);
    console.log("Firestore updated");

    // Fetch the updated user profile
    const updatedUser = await adminAuth.getUser(session.user.id);
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.data();

    console.log("Updated user data:", {
      id: updatedUser.uid,
      name: updatedUser.displayName || userData?.name,
      email: updatedUser.email,
      picture: updatedUser.photoURL || userData?.picture,
      ...userData
    });

    return {
      success: true,
      user: convertTimestamps({
        id: updatedUser.uid,
        name: updatedUser.displayName || userData?.name,
        email: updatedUser.email,
        picture: updatedUser.photoURL || userData?.picture,
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
    console.log("Firebase Auth user:", {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    });

    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.data();
    console.log("Firestore user data:", userData);

    const combinedUser = {
      id: user.uid,
      name: user.displayName,
      email: user.email,
      image: user.photoURL || userData?.picture, // Try both sources
      picture: userData?.picture || user.photoURL, // Include both fields
      ...userData
    };

    console.log("Combined user data:", combinedUser);

    return {
      success: true,
      user: convertTimestamps(combinedUser)
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, error: "Failed to fetch profile" };
  }
}
