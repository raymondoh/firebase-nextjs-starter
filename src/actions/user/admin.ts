"use server";

import { auth } from "@/auth";
import { adminAuth, adminDb } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { convertTimestamps } from "@/firebase/utils/firestore";
import type { CollectionReference, Query, DocumentData } from "firebase-admin/firestore";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import type { User, UserRole, UserSearchState, UserRoleUpdateState } from "@/types/user/common";

// FETCH USERS (admin only)
export async function fetchUsers(limit = 10, offset = 0) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    const usersQuery = adminDb.collection("users").limit(limit).offset(offset);
    const usersSnapshot = await usersQuery.get();
    const totalSnapshot = await adminDb.collection("users").count().get();
    const total = totalSnapshot.data().count;

    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      const convert = (ts: unknown): Date | null =>
        ts && typeof ts === "object" && "toDate" in ts ? (ts as Timestamp).toDate() : null;

      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role || "user",
        emailVerified: data.emailVerified || false,
        status: data.status || "active",
        createdAt: convert(data.createdAt),
        lastLoginAt: convert(data.lastLoginAt),
        updatedAt: convert(data.updatedAt)
      } as User;
    });

    return { success: true, users, total };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to fetch users";
    console.error("Error fetching users:", message);
    return { success: false, error: message };
  }
}

// SEARCH USERS (admin only)
export async function searchUsers(prevState: UserSearchState, formData: FormData): Promise<UserSearchState> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.data();
    if (!userData || userData.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    const query = formData.get("query") as string;
    const limit = parseInt(formData.get("limit") as string) || 10;
    const offset = parseInt(formData.get("offset") as string) || 0;

    let usersQuery: CollectionReference<DocumentData> | Query<DocumentData> = adminDb.collection("users");

    if (query) {
      usersQuery = usersQuery
        .where("name", ">=", query)
        .where("name", "<=", query + "\uf8ff")
        .limit(limit)
        .offset(offset);
    } else {
      usersQuery = usersQuery.limit(limit).offset(offset);
    }

    const usersSnapshot = await usersQuery.get();
    const totalSnapshot = await adminDb.collection("users").count().get();
    const total = totalSnapshot.data().count;

    const users = await Promise.all(
      usersSnapshot.docs.map(async doc => {
        const userData = doc.data();
        try {
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
        } catch (error) {
          console.error("Error fetching auth user:", error);
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

    return { success: true, users, total };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to search users";
    console.error("Error searching users:", message);
    return { success: false, error: message };
  }
}

// UPDATE USER ROLE
export async function updateUserRole(prevState: UserRoleUpdateState, formData: FormData): Promise<UserRoleUpdateState> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const adminDoc = await adminDb.collection("users").doc(session.user.id).get();
    const adminData = adminDoc.data();
    if (!adminData || adminData.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    const userId = formData.get("userId") as string;
    const role = formData.get("role") as UserRole;

    if (!userId) return { success: false, error: "User ID is required" };
    if (!["user", "admin"].includes(role)) {
      return { success: false, error: "Role must be either 'user' or 'admin'" };
    }
    if (userId === session.user.id) {
      return { success: false, error: "You cannot change your own role" };
    }

    await adminDb.collection("users").doc(userId).update({
      role,
      updatedAt: Timestamp.now()
    });

    return { success: true, message: `User role updated to ${role}` };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update user role";
    console.error("Error updating user role:", message);
    return { success: false, error: message };
  }
}

// UPDATE USER
export async function updateUser(userId: string, userData: Partial<User>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const adminDoc = await adminDb.collection("users").doc(session.user.id).get();
    const adminData = adminDoc.data();
    if (!adminData || adminData.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    const updateData = {
      ...userData,
      updatedAt: Timestamp.now()
    };

    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    await adminDb.collection("users").doc(userId).update(updateData);
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Failed to update user" };
  }
}

// CREATE USER
export async function createUser(userData: Partial<User>) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const adminDoc = await adminDb.collection("users").doc(session.user.id).get();
    const adminData = adminDoc.data();
    if (!adminData || adminData.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    const newUserData = {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: "active"
    };

    const userRef = await adminDb.collection("users").add(newUserData);
    revalidatePath("/admin/users");

    return { success: true, userId: userRef.id };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

// DELETE USER
export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const adminDoc = await adminDb.collection("users").doc(session.user.id).get();
    const adminData = adminDoc.data();
    if (!adminData || adminData.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    if (userId === session.user.id) {
      return { success: false, error: "You cannot delete your own account" };
    }

    await adminDb.collection("users").doc(userId).delete();
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
