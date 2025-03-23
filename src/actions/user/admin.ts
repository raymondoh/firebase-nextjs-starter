"use server";

import { auth } from "@/auth";
import { adminAuth, adminDb } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import type { CollectionReference, Query, DocumentData } from "firebase-admin/firestore";
import type { User, UserRole, UserSearchState, UserRoleUpdateState } from "@/types/user/common";
import { revalidatePath } from "next/cache";
import { convertTimestamps } from "@/firebase/utils/firestore";

// Functions: searchUsers, updateUserRole, updateUser, createUser, deleteUser
// These functions are used in the admin dashboard to manage users.

// Fetch users (admin only)
export async function fetchUsers(limit = 10, offset = 0) {
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

    // Fetch users with pagination
    const usersQuery = adminDb.collection("users").limit(limit).offset(offset);
    const usersSnapshot = await usersQuery.get();

    // Get total count (for pagination)
    const totalSnapshot = await adminDb.collection("users").count().get();
    const total = totalSnapshot.data().count;

    // Map results to User objects
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();

      // Helper function to convert Firestore timestamp to Date
      const convertTimestamp = (timestamp: unknown): Date | null => {
        if (!timestamp) return null;

        if (
          typeof timestamp === "object" &&
          timestamp !== null &&
          "toDate" in timestamp &&
          typeof (timestamp as { toDate?: unknown }).toDate === "function"
        ) {
          return (timestamp as { toDate: () => Date }).toDate();
        }

        return null;
      };

      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role || "user",
        emailVerified: data.emailVerified || false,
        status: data.status || "active",
        createdAt: convertTimestamp(data.createdAt),
        lastLoginAt: convertTimestamp(data.lastLoginAt),
        updatedAt: convertTimestamp(data.updatedAt)
      } as User;
    });

    return {
      success: true,
      users,
      total
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
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
    let usersQuery: CollectionReference<DocumentData> | Query<DocumentData> = adminDb.collection("users");

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
            name: authUser.displayName || userData.name,
            email: authUser.email,
            image: authUser.photoURL || userData.picture,
            role: userData.role || "user",
            bio: userData.bio || "",
            ...(convertTimestamps(userData) as Partial<User>),
            id: doc.id
          } as User;
        } catch (error: unknown) {
          // Optional: Log the error if needed
          console.error("Error fetching auth user:", error);

          // Fallback to Firestore-only data
          return {
            name: userData.name || "",
            email: userData.email || "",
            image: userData.picture || "",
            role: userData.role || "user",
            bio: userData.bio || "",
            ...(convertTimestamps(userData) as Partial<User>),
            id: doc.id
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

// Update user (admin only)
export async function updateUser(userId: string, userData: Partial<User>) {
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

    // Add updatedAt timestamp
    const updateData = {
      ...userData,
      updatedAt: Timestamp.now()
    };

    // Remove any undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    // Update the user document
    await adminDb.collection("users").doc(userId).update(updateData);

    // Revalidate the users page
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error };
  }
}

// Create user (admin only)
export async function createUser(userData: Partial<User>) {
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

    // Add timestamps
    const newUserData = {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: "active"
    };

    // Create the user document
    const userRef = await adminDb.collection("users").add(newUserData);

    // Revalidate the users page
    revalidatePath("/admin/users");

    return { success: true, userId: userRef.id };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error };
  }
}

// Delete user (admin only)
export async function deleteUser(userId: string) {
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

    // Prevent deleting own account
    if (userId === session.user.id) {
      return { success: false, error: "You cannot delete your own account" };
    }

    // Delete the user document
    await adminDb.collection("users").doc(userId).delete();

    // Revalidate the users page
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error };
  }
}
