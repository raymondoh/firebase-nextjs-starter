"use server";

// ================= Imports =================
import { auth } from "@/auth";
import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { serverTimestamp } from "@/utils/date-server";
import { createUser as createUserInFirebase, logActivity } from "@/firebase/actions";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { revalidatePath } from "next/cache";
import { serializeUser } from "@/utils/serializeUser";
import { getUserImage } from "@/utils/get-user-image";
import { logger } from "@/utils/logger";

import type {
  CreateUserInput,
  CreateUserResponse,
  FetchUsersResponse,
  SearchUsersResponse,
  UpdateUserResponse,
  UpdateUserRoleResponse
} from "@/types/user";
import type { User, SerializedUser, UserRole } from "@/types/user/common";
import type { CollectionReference, Query, DocumentData } from "firebase-admin/firestore";

// ================= Admin User Actions =================

/**
 * Create a new user (admin only)
 */
export async function createUser({ email, password, name, role }: CreateUserInput): Promise<CreateUserResponse> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const result = await createUserInFirebase({ email, password, displayName: name, createdBy: session.user.id, role });

    if (!result.success) {
      return { success: false, error: result.error || "Failed to create user" };
    }

    await logActivity({
      userId: session.user.id,
      type: "admin-action",
      description: `Created a new user (${email})`,
      status: "success",
      metadata: { createdUserId: result.uid, createdUserEmail: email, createdUserRole: role || "user" }
    });

    revalidatePath("/admin/users");

    return { success: true, userId: result.uid };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error";

    logger({ type: "error", message: "Error in createUser", metadata: { error: message }, context: "admin-users" });

    return { success: false, error: message };
  }
}

/**
 * Fetch users (admin only)
 */
export async function fetchUsers(limit = 10, offset = 0): Promise<FetchUsersResponse> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const adminData = (await adminDb.collection("users").doc(session.user.id).get()).data();
    if (!adminData || adminData.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    const usersQuery = adminDb.collection("users").limit(limit).offset(offset);
    const usersSnapshot = await usersQuery.get();
    const totalSnapshot = await adminDb.collection("users").count().get();
    const total = totalSnapshot.data().count;

    const users: SerializedUser[] = usersSnapshot.docs.map(doc => {
      const data = doc.data() as Partial<User>;
      const rawUser: User = {
        id: doc.id,
        name: data.name ?? "",
        email: data.email ?? "",
        role: data.role ?? "user",
        emailVerified: data.emailVerified ?? false,
        status: data.status ?? "active",
        image: getUserImage(data),
        createdAt: data.createdAt,
        lastLoginAt: data.lastLoginAt,
        updatedAt: data.updatedAt
      };
      return serializeUser(rawUser);
    });

    return { success: true, users, total };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to fetch users";
    logger({ type: "error", message: "Error in fetchUsers", metadata: { error: message }, context: "admin-users" });
    return { success: false, error: message };
  }
}

/**
 * Search users by query (admin only)
 */
export async function searchUsers(_: SearchUsersResponse, formData: FormData): Promise<SearchUsersResponse> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const adminData = (await adminDb.collection("users").doc(session.user.id).get()).data();
    if (!adminData || adminData.role !== "admin") {
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

    const users: SerializedUser[] = await Promise.all(
      usersSnapshot.docs.map(async doc => {
        const data = doc.data() as Partial<User>;
        let rawUser: User = {
          id: doc.id,
          name: data.name ?? "",
          email: data.email ?? "",
          role: data.role ?? "user",
          bio: data.bio ?? "",
          emailVerified: data.emailVerified ?? false,
          status: data.status ?? "active",
          createdAt: data.createdAt,
          lastLoginAt: data.lastLoginAt,
          updatedAt: data.updatedAt
        };
        try {
          const authUser = await adminAuth.getUser(doc.id);
          rawUser = {
            ...rawUser,
            name: authUser.displayName || rawUser.name,
            email: authUser.email || rawUser.email,
            image: getUserImage({ ...data, photoURL: authUser.photoURL })
          };
        } catch {
          // fallback silently
        }
        return serializeUser(rawUser);
      })
    );

    return { success: true, users, total };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to search users";
    logger({ type: "error", message: "Error in searchUsers", metadata: { error: message }, context: "admin-users" });
    return { success: false, error: message };
  }
}

/**
 * Update a user's role (admin only)
 */
export async function updateUserRole(_: UpdateUserRoleResponse, formData: FormData): Promise<UpdateUserRoleResponse> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const adminData = (await adminDb.collection("users").doc(session.user.id).get()).data();
    if (!adminData || adminData.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    const userId = formData.get("userId") as string;
    const role = formData.get("role") as UserRole;

    if (!userId) return { success: false, error: "User ID is required" };
    if (!["user", "admin"].includes(role)) return { success: false, error: "Role must be either 'user' or 'admin'" };
    if (userId === session.user.id) return { success: false, error: "You cannot change your own role" };

    await adminDb.collection("users").doc(userId).update({ role, updatedAt: serverTimestamp() });

    logger({ type: "info", message: `Updated role for userId ${userId} to ${role}`, context: "admin-users" });

    return { success: true, message: `User role updated to ${role}` };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update user role";
    logger({ type: "error", message: "Error in updateUserRole", metadata: { error: message }, context: "admin-users" });
    return { success: false, error: message };
  }
}

/**
 * Update user fields (admin only)
 */
export async function updateUser(userId: string, userData: Partial<User>): Promise<UpdateUserResponse> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const adminData = (await adminDb.collection("users").doc(session.user.id).get()).data();
    if (!adminData || adminData.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    const updateData = { ...userData, updatedAt: serverTimestamp() };
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    await adminDb.collection("users").doc(userId).update(updateData);
    revalidatePath("/admin/users");

    logger({ type: "info", message: `Updated user ${userId}`, context: "admin-users" });

    return { success: true };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update user";
    logger({ type: "error", message: "Error in updateUser", metadata: { error: message }, context: "admin-users" });
    return { success: false, error: message };
  }
}
