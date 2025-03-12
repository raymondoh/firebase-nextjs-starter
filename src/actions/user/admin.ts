"use server";

import { auth } from "@/auth";
//import { adminAuth, adminDb } from "@/firebase/admin";
import { adminAuth, adminDb } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import type { User, UserRole, UserSearchState, UserRoleUpdateState } from "@/types/user";
import { convertTimestamps } from "@/actions/utils";

// Functions: searchUsers, updateUserRole
// These functions are used in the admin dashboard to search for users and update their roles.
// The searchUsers function is used to search for users by name, email, or ID.
// The updateUserRole function is used to update a user's role to either "user" or "admin".

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
