"use server";

import { adminAuth, adminDb } from "./admin/index";
import { auth } from "@/auth";
import { Timestamp } from "firebase-admin/firestore";
import type { User, UserRole } from "@/types/user";
import type {
  ActivityLogData,
  GetUserActivityLogsResult,
  LogActivityResult,
  ActivityLogWithId
} from "@/types/firebase/activity";
import type {
  SetCustomClaimsResult,
  VerifyAndCreateUserResult,
  GetUserFromTokenResult,
  SendResetPasswordEmailResult
} from "@/types/firebase/auth";
import type {
  UserDocumentData,
  GetUsersResult,
  CreateUserDocumentResult,
  UpdateUserProfileResult,
  GetUserProfileResult,
  SetUserRoleResult
} from "@/types/firebase/firestore";

// ===== Auth Functions =====

/**
 * Set custom claims for a user
 */
export async function setCustomClaims(uid: string, claims: Record<string, any>): Promise<SetCustomClaimsResult> {
  try {
    await adminAuth.setCustomUserClaims(uid, claims);
    console.log("Custom claims set successfully");
    return { success: true };
  } catch (error) {
    console.error("Error setting custom claims:", error);
    return { success: false, error };
  }
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string) {
  try {
    return await adminAuth.getUserByEmail(email);
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
}

/**
 * Get a user by ID
 */
export async function getUser(uid: string) {
  try {
    return await adminAuth.getUser(uid);
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}

/**
 * Update a user
 */
export async function updateUser(
  uid: string,
  properties: { displayName?: string; photoURL?: string; password?: string }
) {
  try {
    return await adminAuth.updateUser(uid, properties);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(properties: { email: string; password: string; displayName?: string }) {
  try {
    return await adminAuth.createUser(properties);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Delete a user
 */
export async function deleteUser(uid: string) {
  try {
    return await adminAuth.deleteUser(uid);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

/**
 * Verify an ID token
 */
export async function verifyIdToken(token: string) {
  try {
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw error;
  }
}

/**
 * Verify a token and create a user document
 */
export async function verifyAndCreateUser(token: string): Promise<VerifyAndCreateUserResult> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    await createUserDocument(decodedToken.uid, {
      id: decodedToken.uid,
      email: decodedToken.email || "",
      name: decodedToken.name || "",
      image: decodedToken.picture || "",
      role: "user"
    });

    return { success: true, uid: decodedToken.uid };
  } catch (error) {
    console.error("Error verifying token:", error);
    return { success: false, error: "Invalid token" };
  }
}

/**
 * Get user information from a token
 */
export async function getUserFromToken(token: string): Promise<GetUserFromTokenResult> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { success: true, user: decodedToken };
  } catch (error) {
    console.error("Error getting user from token:", error);
    return { success: false, error: "Invalid token" };
  }
}

/**
 * Send a password reset email
 */
export async function sendResetPasswordEmail(email: string): Promise<SendResetPasswordEmailResult> {
  try {
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      handleCodeInApp: true
    };

    await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error sending password reset email:", error);
    // For security reasons, don't reveal if the email exists or not
    if (error && typeof error === "object" && "code" in error && error.code === "auth/user-not-found") {
      return { success: true };
    }
    return { success: false, error: "Failed to send reset email" };
  }
}

// ===== User Functions =====

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const role = await getUserRole(session.user.id);
  return {
    id: session.user.id,
    name: session.user.name || "",
    email: session.user.email || "",
    image: session.user.image || "",
    role: role as UserRole
  };
}

/**
 * Get users with pagination
 */
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
    console.error("Error creating user document:", error);
    return { success: false, error: "Failed to create user document" };
  }
}

/**
 * Get a user's role
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

// ===== Activity Functions =====

/**
 * Log user activity
 */
export async function logActivity(data: Omit<ActivityLogData, "timestamp">): Promise<LogActivityResult> {
  try {
    const docRef = await adminDb.collection("activityLogs").add({
      ...data,
      timestamp: Timestamp.now()
    });
    return { success: true, activityId: docRef.id }; // Return the correct object
  } catch (error) {
    console.error("Error logging activity:", error instanceof Error ? error.message : String(error));
    return { success: false, error: error instanceof Error ? error.message : String(error) }; // Return the correct object
  }
}

/**
 * Get user activity logs with pagination support
 */
export async function getUserActivityLogs(
  limit = 100,
  startAfter?: string,
  type?: string
): Promise<GetUserActivityLogsResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    let query = adminDb.collection("activityLogs").where("userId", "==", session.user.id);

    if (type) {
      query = query.where("type", "==", type);
    }

    query = query.orderBy("timestamp", "desc");

    if (startAfter) {
      const startAfterDoc = await adminDb.collection("activityLogs").doc(startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    query = query.limit(limit);

    const logsSnapshot = await query.get();

    const activities: ActivityLogWithId[] = logsSnapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          userId: doc.data().userId,
          type: doc.data().type,
          description: doc.data().description,
          status: doc.data().status,
          timestamp: doc.data().timestamp,
          ipAddress: doc.data().ipAddress,
          location: doc.data().location,
          device: doc.data().device,
          deviceType: doc.data().deviceType,
          metadata: doc.data().metadata
        } as ActivityLogWithId)
    );

    return { success: true, activities };
  } catch (error) {
    console.error("Error getting activity logs:", error instanceof Error ? error.message : String(error));
    return { success: false, error: "Error getting activity logs" };
  }
}
