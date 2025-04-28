"use server";

import { adminDb, adminAuth } from "./firebase-admin-init";
import { auth } from "@/auth";
import { Timestamp, DocumentSnapshot } from "firebase-admin/firestore";

import type { User, UserRole } from "@/types/user";
import type {
  UserDocumentData,
  GetUsersResult,
  CreateUserDocumentResult,
  UpdateUserProfileResult,
  GetUserProfileResult,
  SetUserRoleResult
} from "@/types/firebase/firestore";

import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { getUserImage } from "@/utils/get-user-image";

// ================= User CRUD Operations =================

/**
 * Get users with pagination
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
        image: getUserImage(data),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt
      } as User;
    });

    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return {
      success: true,
      users,
      lastVisible: lastVisible?.id
    };
  } catch (error) {
    console.error("Error fetching users:", getErrorMessage(error));
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create a user document in Firestore
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
    console.error("Error creating user document:", getErrorMessage(error));
    return { success: false, error: getErrorMessage(error) };
  }
}

// ================= User Role Operations =================

/**
 * Get a user's role
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const userDoc: DocumentSnapshot = await adminDb.collection("users").doc(userId).get();
    const userData = userDoc.data() as UserDocumentData | undefined;
    return (userData?.role as UserRole) || "user";
  } catch (error) {
    console.error("Error getting user role:", getErrorMessage(error));
    return "user"; // fallback default
  }
}

/**
 * Set a user's role
 */
export async function setUserRole(userId: string, role: UserRole): Promise<SetUserRoleResult> {
  try {
    await adminDb.collection("users").doc(userId).update({
      role,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error("Error setting user role:", getErrorMessage(error));
    return { success: false, error: getErrorMessage(error) };
  }
}

// ================= User Profile Operations =================

/**
 * Update a user's profile
 */
export async function updateUserProfile(
  userId: string,
  updateData: { name?: string; picture?: string }
): Promise<UpdateUserProfileResult> {
  try {
    const userDocRef = adminDb.collection("users").doc(userId);
    const userDoc: DocumentSnapshot = await userDocRef.get();

    if (!userDoc.exists) {
      return { success: false, error: "User not found" };
    }

    const updates: Partial<UserDocumentData> = {
      ...updateData,
      updatedAt: new Date()
    };

    await userDocRef.update(updates);

    if (updateData.name) {
      await adminAuth.updateUser(userId, { displayName: updateData.name });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", getErrorMessage(error));
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get a user's profile
 */
export async function getUserProfile(userId: string): Promise<GetUserProfileResult> {
  try {
    const userDoc: DocumentSnapshot = await adminDb.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return { success: false, error: "User not found" };
    }

    const userData = userDoc.data() as UserDocumentData;

    const user: User = {
      id: userDoc.id,
      ...userData,
      image: getUserImage(userData),
      createdAt:
        userData.createdAt instanceof Timestamp ? userData.createdAt.toDate().toISOString() : userData.createdAt,
      updatedAt:
        userData.updatedAt instanceof Timestamp ? userData.updatedAt.toDate().toISOString() : userData.updatedAt
    };

    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user profile:", getErrorMessage(error));
    return { success: false, error: getErrorMessage(error) };
  }
}

// ================= Current User =================

/**
 * Get the currently authenticated user
 */
export async function getCurrentUser(): Promise<{ success: true; data: User } | { success: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "No authenticated user found" };
    }

    const role = await getUserRole(session.user.id);

    return {
      success: true,
      data: {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
        image: getUserImage(session.user),
        role
      }
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// ================= Helpers =================

/**
 * Format and return a consistent error message
 */
function getErrorMessage(error: unknown): string {
  if (isFirebaseError(error)) return firebaseError(error);
  if (error instanceof Error) return error.message;
  return "Unknown error occurred";
}
