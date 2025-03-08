"use server";

import { auth } from "@/auth";
import { adminAuth, adminDb } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { profileUpdateSchema } from "@/schemas/user";
import type { ProfileUpdateState, User, UserRole, UserSearchState, UserRoleUpdateState } from "@/types/user";

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

// Search users (admin only)
export async function searchUsers(prevState: UserSearchState, formData: FormData): Promise<UserSearchState> {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Check if user is admin
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    // Get search parameters
    const query = formData.get("query") as string;
    const limit = Number.parseInt(formData.get("limit") as string) || 10;
    const offset = Number.parseInt(formData.get("offset") as string) || 0;

    // Perform search
    let usersQuery = adminDb.collection("users");

    if (query) {
      // Search by name, email, or ID
      usersQuery = usersQuery
        .where("name", ">=", query)
        .where("name", "<=", query + "\uf8ff")
        .limit(limit)
        .offset(offset);
    } else {
      // Just get all users with pagination
      usersQuery = usersQuery.limit(limit).offset(offset);
    }

    const usersSnapshot = await usersQuery.get();

    // Get total count (for pagination)
    const totalSnapshot = await adminDb.collection("users").count().get();
    const total = totalSnapshot.data().count;

    // Map results to User objects
    const users = await Promise.all(
      usersSnapshot.docs.map(async doc => {
        const userData = doc.data();

        try {
          // Get user from Firebase Auth for latest info
          const authUser = await adminAuth.getUser(doc.id);

          return {
            id: doc.id,
            name: authUser.displayName || userData.name,
            email: authUser.email,
            image: authUser.photoURL || userData.picture,
            role: userData.role || "user",
            bio: userData.bio || "",
            ...convertTimestamps(userData)
          } as User;
        } catch (error) {
          // If user doesn't exist in Auth, just return Firestore data
          return {
            id: doc.id,
            name: userData.name || "",
            email: userData.email || "",
            image: userData.picture || "",
            role: userData.role || "user",
            bio: userData.bio || "",
            ...convertTimestamps(userData)
          } as User;
        }
      })
    );

    return {
      success: true,
      users,
      total
    };
  } catch (error) {
    console.error("Error searching users:", error);
    return { success: false, error: "Failed to search users" };
  }
}

// Update user role (admin only)
export async function updateUserRole(prevState: UserRoleUpdateState, formData: FormData): Promise<UserRoleUpdateState> {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Check if user is admin
    const adminDoc = await adminDb.collection("users").doc(session.user.id).get();
    const adminData = adminDoc.data();

    if (!adminData || adminData.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    // Get form data
    const userId = formData.get("userId") as string;
    const role = formData.get("role") as UserRole;

    // Validate
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    if (role !== "user" && role !== "admin") {
      return { success: false, error: "Role must be either 'user' or 'admin'" };
    }

    // Prevent changing own role
    if (userId === session.user.id) {
      return { success: false, error: "You cannot change your own role" };
    }

    // Update user role in Firestore
    await adminDb.collection("users").doc(userId).update({
      role,
      updatedAt: Timestamp.now()
    });

    return {
      success: true,
      message: `User role updated to ${role}`
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}
