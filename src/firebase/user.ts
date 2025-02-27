// // src/firebase/user.ts
"use server";

import { adminDb } from "./admin";
//import type { User, UserRole } from "@/types/user";
import type { UserRole } from "@/types/user";
import { Timestamp } from "firebase-admin/firestore";
import {} from "@/types/firebase";

// Add this type
type UserDocumentData = Omit<User, "id"> & {
  createdAt: Date;
  updatedAt: Date;
};

// Update User type to include picture
export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
  // Add other fields as necessary
};

type GetUsersResult = {
  success: boolean;
  users?: User[];
  lastVisible?: string;
  error?: string;
};

export async function getUsers(limit: number = 10, startAfter?: string): Promise<GetUsersResult> {
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

export async function createUserDocument(
  userId: string,
  userData: Partial<User>
): Promise<{ success: boolean; error?: string }> {
  try {
    const userDocData: UserDocumentData = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await adminDb.collection("users").doc(userId).set(userDocData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error creating user document:", error);
    return { success: false, error: "Failed to create user document" };
  }
}

export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userData = userDoc.data() as UserDocumentData | undefined;
    return userData?.role || "user";
  } catch (error) {
    console.error("Error getting user role:", error);
    return "user";
  }
}

export async function setUserRole(userId: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
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

// New function to update user profile
export async function updateUserProfile(
  userId: string,
  updateData: { name?: string; picture?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const userDocRef = adminDb.collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return { success: false, error: "User not found" };
    }

    const updates: Partial<UserDocumentData> = {
      ...updateData,
      updatedAt: new Date()
    };

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

// New function to get user profile
export async function getUserProfile(userId: string): Promise<{ success: boolean; user?: User; error?: string }> {
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
    };

    return { success: true, user };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, error: "Failed to fetch user profile" };
  }
}
