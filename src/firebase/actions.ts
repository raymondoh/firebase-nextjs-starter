// src/firebase/actions.ts
"use server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb, adminAuth } from "./admin/index";
//import { Query, DocumentData } from "firebase-admin/firestore";
import * as adminUsers from "./admin/user";
import { auth } from "@/auth";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import type {
  GetUsersResult,
  CreateUserDocumentResult,
  GetUserProfileResult,
  UpdateUserProfileResult,
  SetUserRoleResult
} from "@/types/firebase/firestore";
// import type {
//   GetProductByIdFromFirestoreResult,
//   UpdateProductInput,
//   UpdateProductResult,
//   Product,
//   SerializedProduct,
//   HeroSlide
// } from "@/types/product";

// import type {
//   GetUserActivityLogsResult,
//   ActivityLogWithId,
//   ActivityLogData,
//   LogActivityResult
// } from "@/types/firebase/activity";
import type {
  SetCustomClaimsResult,
  VerifyAndCreateUserResult,
  GetUserFromTokenResult,
  SendResetPasswordEmailResult,
  CustomClaims
} from "@/types/firebase/auth";
// import type { SerializedHeroSlide, GetHeroSlidesResult, GetHeroSlidesError } from "@/types/carousel/hero";
import type { User, UserRole } from "@/types/user";
// import { serializeProduct, serializeProductArray } from "@/utils/serializeProduct";
import * as adminActivity from "./admin/activity";
import * as adminProducts from "./admin/products";

// ================= User CRUD =================

export async function createUser(properties: { email: string; password: string; displayName?: string }) {
  try {
    const user = await adminAuth.createUser(properties);
    return { success: true, data: user };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error creating user";

    return { success: false, error: message };
  }
}

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
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Invalid token";

    return { success: false, error: message };
  }
}

export async function deleteUser(uid: string) {
  try {
    await adminAuth.deleteUser(uid);
    return { success: true };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error deleting user";

    return { success: false, error: message };
  }
}

export async function updateUser(
  uid: string,
  properties: { displayName?: string; photoURL?: string; password?: string }
) {
  try {
    const user = await adminAuth.updateUser(uid, properties);
    return { success: true, data: user };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error updating user";

    return { success: false, error: message };
  }
}

// ===== User Functions =====
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
        image: session.user.image || "",
        role: role as UserRole
      }
    };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error getting current user";

    return { success: false, error: message };
  }
}

export async function getUser(uid: string) {
  try {
    const user = await adminAuth.getUser(uid);
    return { success: true, data: user };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error getting user";

    return { success: false, error: message };
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await adminAuth.getUserByEmail(email);
    return { success: true, data: user };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error getting user by email";

    return { success: false, error: message };
  }
}

export async function getUserFromToken(token: string): Promise<GetUserFromTokenResult> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { success: true, user: decodedToken };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Invalid token";

    return { success: false, error: message };
  }
}

export async function getUsers(limit = 10, startAfter?: string): Promise<GetUsersResult> {
  try {
    return await adminUsers.getUsers(limit, startAfter);
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error fetching users";

    return { success: false, error: message };
  }
}

export async function createUserDocument(userId: string, userData: Partial<User>): Promise<CreateUserDocumentResult> {
  try {
    return await adminUsers.createUserDocument(userId, userData);
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error creating user document";

    return { success: false, error: message };
  }
}

export async function getUserProfile(userId: string): Promise<GetUserProfileResult> {
  try {
    return await adminUsers.getUserProfile(userId);
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error getting user profile";

    return { success: false, error: message };
  }
}

export async function updateUserProfile(
  userId: string,
  updateData: { name?: string; picture?: string }
): Promise<UpdateUserProfileResult> {
  try {
    return await adminUsers.updateUserProfile(userId, updateData);
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error updating profile";

    return { success: false, error: message };
  }
}

export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    return await adminUsers.getUserRole(userId);
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error getting user role";

    console.error("Error getting user role:", message);
    return "user";
  }
}

export async function setUserRole(userId: string, role: UserRole): Promise<SetUserRoleResult> {
  try {
    return await adminUsers.setUserRole(userId, role);
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error setting user role";

    return { success: false, error: message };
  }
}

// ================= Activity Logs =================
export async function getAllActivityLogs(...args: Parameters<typeof adminActivity.getAllActivityLogs>) {
  return adminActivity.getAllActivityLogs(...args);
}

export async function getUserActivityLogs(...args: Parameters<typeof adminActivity.getUserActivityLogs>) {
  return adminActivity.getUserActivityLogs(...args);
}

export async function logActivity(...args: Parameters<typeof adminActivity.logActivity>) {
  return adminActivity.logActivity(...args);
}

// ================= Email =================
export async function sendResetPasswordEmail(email: string): Promise<SendResetPasswordEmailResult> {
  try {
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      handleCodeInApp: true
    };

    await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
    return { success: true };
  } catch (error: unknown) {
    if (isFirebaseError(error) && error.code === "auth/user-not-found") {
      return { success: true }; // Silent success for security reasons
    }

    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Failed to send reset email";

    return { success: false, error: message };
  }
}

export async function setCustomClaims(uid: string, claims: CustomClaims): Promise<SetCustomClaimsResult> {
  try {
    await adminAuth.setCustomUserClaims(uid, claims);
    return { success: true };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error setting custom claims";

    return { success: false, error: message };
  }
}

export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { success: true, data: decodedToken };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Invalid ID token";

    return { success: false, error: message };
  }
}

// ================= Product =================

export async function getAllProductsFromFirestore(
  ...args: Parameters<typeof adminProducts.getAllProductsFromFirestore>
) {
  return adminProducts.getAllProductsFromFirestore(...args);
}

export async function addProductToFirestore(...args: Parameters<typeof adminProducts.addProductToFirestore>) {
  return adminProducts.addProductToFirestore(...args);
}

export async function getProductByIdFromFirestore(
  ...args: Parameters<typeof adminProducts.getProductByIdFromFirestore>
) {
  return adminProducts.getProductByIdFromFirestore(...args);
}

export async function updateProductInFirestore(...args: Parameters<typeof adminProducts.updateProductInFirestore>) {
  return adminProducts.updateProductInFirestore(...args);
}

export async function deleteProductFromFirestore(...args: Parameters<typeof adminProducts.deleteProductFromFirestore>) {
  return adminProducts.deleteProductFromFirestore(...args);
}

export async function getFeaturedProductsFromFirestore(
  ...args: Parameters<typeof adminProducts.getFeaturedProductsFromFirestore>
) {
  return adminProducts.getFeaturedProductsFromFirestore(...args);
}

export async function getHeroSlidesFromFirestore(...args: Parameters<typeof adminProducts.getHeroSlidesFromFirestore>) {
  return adminProducts.getHeroSlidesFromFirestore(...args);
}
// ================= Hero Slides =================
export async function getHeroSlides(...args: Parameters<typeof adminProducts.getHeroSlidesFromFirestore>) {
  return await adminProducts.getHeroSlidesFromFirestore(...args);
}
