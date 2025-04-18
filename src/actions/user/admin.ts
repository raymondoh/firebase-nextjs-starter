// // //src/actions/user/admin.ts
"use server";

import { auth } from "@/auth";
import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { serverTimestamp } from "@/utils/date-server";
import { createUser as createUserInFirebase, logActivity } from "@/firebase/actions";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import type { CollectionReference, Query, DocumentData } from "firebase-admin/firestore";
import type {
  CreateUserInput,
  CreateUserResponse,
  FetchUsersResponse,
  SearchUsersResponse,
  UpdateUserResponse,
  UpdateUserRoleResponse
} from "@/types/user";
import type { User, SerializedUser, UserRole } from "@/types/user/common";
import { revalidatePath } from "next/cache";
import { serializeUser } from "@/utils/serializeUser";
import { getUserImage } from "@/utils/get-user-image";

export async function createUser({ email, password, name, role }: CreateUserInput): Promise<CreateUserResponse> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const result = await createUserInFirebase({
      email,
      password,
      displayName: name,
      createdBy: session.user.id,
      role
    });

    if (!result.success) return { success: false, error: result.error || "Failed to create user" };

    const uid = result.uid;

    await logActivity({
      userId: session.user.id,
      type: "admin-action",
      description: `Created a new user (${email})`,
      status: "success",
      metadata: { createdUserId: uid, createdUserEmail: email, createdUserRole: role || "user" }
    });

    revalidatePath("/admin/users");

    return { success: true, userId: uid };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error";
    return { success: false, error: message };
  }
}

export async function fetchUsers(limit = 10, offset = 0): Promise<FetchUsersResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Check for admin privileges
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    const usersQuery = adminDb.collection("users").limit(limit).offset(offset);
    const usersSnapshot = await usersQuery.get();
    const totalSnapshot = await adminDb.collection("users").count().get();
    const total = totalSnapshot.data().count;

    // Build raw user data and serialize it
    const users: SerializedUser[] = usersSnapshot.docs.map(doc => {
      const data = doc.data() as Partial<User>;
      const rawUser: User = {
        id: doc.id,
        name: data.name ?? null,
        email: data.email ?? null,
        image: getUserImage(data),
        //photoURL: data.photoURL ?? null,
        role: data.role ?? "user",
        emailVerified: data.emailVerified ?? false,
        status: data.status ?? "active",
        createdAt: data.createdAt ?? undefined,
        lastLoginAt: data.lastLoginAt ?? undefined,
        updatedAt: data.updatedAt ?? undefined
      };
      console.log("rawUser:", rawUser);

      return serializeUser(rawUser);
    });

    return { success: true, users, total };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to fetch users";
    console.error("Error fetching users:", message);
    return { success: false, error: message };
  }
}

export async function searchUsers(_: SearchUsersResponse, formData: FormData): Promise<SearchUsersResponse> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const adminData = (await adminDb.collection("users").doc(session.user.id).get()).data();
    if (!adminData || adminData.role !== "admin")
      return { success: false, error: "Unauthorized. Admin access required." };

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
          name: data.name || "",
          email: data.email || "",
          role: data.role || "user",
          //image: data.picture || "",
          //image: getUserImage(data),
          bio: data.bio || "",
          emailVerified: data.emailVerified ?? false,
          status: data.status ?? "active",
          createdAt: data.createdAt ?? undefined,
          lastLoginAt: data.lastLoginAt ?? undefined,
          updatedAt: data.updatedAt ?? undefined
        };
        try {
          const authUser = await adminAuth.getUser(doc.id);
          rawUser = {
            ...rawUser,
            name: authUser.displayName || rawUser.name,
            email: authUser.email || rawUser.email,
            image: getUserImage({ ...data, photoURL: authUser.photoURL }) // ✅ correct this line
          };
        } catch {
          // Fall back to raw user data if the auth lookup fails
        }
        return serializeUser(rawUser);
      })
    );

    return { success: true, users, total };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to search users";
    console.error("Error searching users:", message);
    return { success: false, error: message };
  }
}

export async function updateUserRole(_: UpdateUserRoleResponse, formData: FormData): Promise<UpdateUserRoleResponse> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const adminData = (await adminDb.collection("users").doc(session.user.id).get()).data();
    if (!adminData || adminData.role !== "admin")
      return { success: false, error: "Unauthorized. Admin access required." };

    const userId = formData.get("userId") as string;
    const role = formData.get("role") as UserRole;

    if (!userId) return { success: false, error: "User ID is required" };
    if (!["user", "admin"].includes(role)) return { success: false, error: "Role must be either 'user' or 'admin'" };
    if (userId === session.user.id) return { success: false, error: "You cannot change your own role" };

    await adminDb.collection("users").doc(userId).update({ role, updatedAt: serverTimestamp() });
    return { success: true, message: `User role updated to ${role}` };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update user role";
    return { success: false, error: message };
  }
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<UpdateUserResponse> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const adminData = (await adminDb.collection("users").doc(session.user.id).get()).data();
    if (!adminData || adminData.role !== "admin")
      return { success: false, error: "Unauthorized. Admin access required." };

    const updateData = {
      ...userData,
      updatedAt: serverTimestamp()
    };

    // Remove keys with undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    await adminDb.collection("users").doc(userId).update(updateData);
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    const message = isFirebaseError(error) ? firebaseError(error) : "Failed to update user";
    return { success: false, error: message };
  }
}
