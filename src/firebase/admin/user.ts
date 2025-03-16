// src/firebase/admin/user.ts
"use server";

import { adminDb, adminAuth } from "./index";
import { Timestamp } from "firebase-admin/firestore";
import type { User, UserRole } from "@/types/user";
import type {
  UserDocumentData,
  GetUsersResult,
  CreateUserDocumentResult,
  UpdateUserProfileResult,
  GetUserProfileResult,
  SetUserRoleResult
} from "@/types/firebase/firestore";

/**
 * Get users with pagination
 * @param limit - The maximum number of users to retrieve
 * @param startAfter - The ID of the last user in the previous page
 */
export async function getUsers(limit = 10, startAfter?: string): Promise<GetUsersResult> {
  try {
    let query = adminDb.collection("users").orderBy("createdAt", "desc").limit(limit);

    if (startAfter) {
      const lastDoc = await adminDb.collection("users").doc(startAfter).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();

    const users: User[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt
      } as User;
    });

    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return {
      success: true,
      users,
      lastVisible: lastVisible ? lastVisible.id : undefined
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

/**
 * Create a user document in Firestore
 * @param userId - The user ID
 * @param userData - The user data
 */
export async function createUserDocument(userId: string, userData: Partial<User>): Promise<CreateUserDocumentResult> {
  try {
    const userDocData: UserDocumentData = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as UserDocumentData;

    await adminDb.collection("users").doc(userId).set(userDocData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error creating user document:", error);
    return { success: false, error: "Failed to create user document" };
  }
}

/**
 * Get a user's role
 * @param userId - The user ID
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userData = userDoc.data() as UserDocumentData | undefined;
    return (userData?.role as UserRole) || "user";
  } catch (error) {
    console.error("Error getting user role:", error);
    return "user";
  }
}

/**
 * Set a user's role
 * @param userId - The user ID
 * @param role - The role to set
 */
export async function setUserRole(userId: string, role: UserRole): Promise<SetUserRoleResult> {
  try {
    await adminDb.collection("users").doc(userId).update({
      role,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error("Error setting user role:", error);
    return { success: false, error: "Failed to set user role" };
  }
}

/**
 * Update a user's profile
 * @param userId - The user ID
 * @param updateData - The data to update
 */
export async function updateUserProfile(
  userId: string,
  updateData: { name?: string; picture?: string }
): Promise<UpdateUserProfileResult> {
  try {
    const userDocRef = adminDb.collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return { success: false, error: "User not found" };
    }

    const updates: Partial<UserDocumentData> = {
      ...updateData,
      updatedAt: new Date()
    } as Partial<UserDocumentData>;

    await userDocRef.update(updates);

    // Update the user's display name in Firebase Auth
    if (updateData.name) {
      await adminAuth.updateUser(userId, { displayName: updateData.name });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: "Failed to update user profile" };
  }
}

/**
 * Get a user's profile
 * @param userId - The user ID
 */
export async function getUserProfile(userId: string): Promise<GetUserProfileResult> {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return { success: false, error: "User not found" };
    }

    const userData = userDoc.data() as UserDocumentData;
    const user: User = {
      id: userDoc.id,
      ...userData,
      createdAt:
        userData.createdAt instanceof Timestamp ? userData.createdAt.toDate().toISOString() : userData.createdAt,
      updatedAt:
        userData.updatedAt instanceof Timestamp ? userData.updatedAt.toDate().toISOString() : userData.updatedAt
    } as User;

    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, error: "Failed to fetch user profile" };
  }
}
