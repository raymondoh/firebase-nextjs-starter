// src/firebase/actions.ts
"use server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb, adminAuth } from "./admin/index";
import { Query, DocumentData } from "firebase-admin/firestore";
import * as adminUsers from "./admin/user";
import { auth } from "@/auth";
//import { getHeroSlides as getHeroSlidesAdmin } from "./admin/hero-slides";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import type {
  GetUsersResult,
  CreateUserDocumentResult,
  GetUserProfileResult,
  UpdateUserProfileResult,
  SetUserRoleResult
} from "@/types/firebase/firestore";
import type {
  GetProductByIdFromFirestoreResult,
  UpdateProductInput,
  UpdateProductResult,
  Product,
  SerializedProduct,
  HeroSlide
} from "@/types/product";

import type {
  GetUserActivityLogsResult,
  ActivityLogWithId,
  ActivityLogData,
  LogActivityResult
} from "@/types/firebase/activity";
import type {
  SetCustomClaimsResult,
  VerifyAndCreateUserResult,
  GetUserFromTokenResult,
  SendResetPasswordEmailResult,
  CustomClaims
} from "@/types/firebase/auth";
import type { SerializedHeroSlide, GetHeroSlidesResult, GetHeroSlidesError } from "@/types/carousel/hero";
import type { User, UserRole } from "@/types/user";
import { serializeProduct, serializeProductArray } from "@/utils/serializeProduct";

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

// ================= Hero Slides =================

export type GetHeroSlidesResponse = GetHeroSlidesResult | GetHeroSlidesError;

export async function getHeroSlides(): Promise<GetHeroSlidesResponse> {
  try {
    const snapshot = await adminDb.collection("heroSlides").orderBy("order").where("active", "==", true).get();

    const slides: SerializedHeroSlide[] = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        backgroundImage: data.backgroundImage,
        cta: data.cta,
        ctaHref: data.ctaHref,
        order: data.order,
        active: data.active,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt
      };
    });

    return { success: true, slides };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error fetching hero slides";

    console.error("Error fetching hero slides:", message);
    return { success: false, error: message };
  }
}

// ================= Activity Logs =================

export async function getAllActivityLogs(
  limit = 10,
  startAfter?: string,
  type?: string
  //description?: string
): Promise<GetUserActivityLogsResult> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    const collectionRef = adminDb.collection("activityLogs");
    let query: Query<DocumentData> = collectionRef;

    if (type) {
      query = query.where("type", "==", type);
    }
    // if (description) {
    //   query = query.where("description", "==", description);
    // }

    query = query.orderBy("timestamp", "desc");

    if (startAfter) {
      const startAfterDoc = await collectionRef.doc(startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    query = query.limit(limit);

    const logsSnapshot = await query.get();

    const activities: ActivityLogWithId[] = await Promise.all(
      logsSnapshot.docs.map(async doc => {
        const data = doc.data();
        let userEmail = "";

        try {
          const user = await adminAuth.getUser(data.userId);
          userEmail = user.email ?? "";
        } catch (error) {
          const message = isFirebaseError(error) ? firebaseError(error) : "Unknown error fetching user email";
          console.warn(`Failed to fetch user for ID ${data.userId}: ${message}`);
        }

        return {
          id: doc.id,
          userId: data.userId,
          type: data.type,
          description: data.description,
          status: data.status,
          timestamp: data.timestamp,
          ipAddress: data.ipAddress,
          location: data.location,
          device: data.device,
          deviceType: data.deviceType,
          metadata: data.metadata,
          userEmail
        };
      })
    );

    return { success: true, activities };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error";

    console.error("Error getting all activity logs:", message);
    return { success: false, error: message };
  }
}

export async function getUserActivityLogs(
  limit = 100,
  startAfter?: string,
  type?: string,
  description?: string // ✅ NEW
): Promise<GetUserActivityLogsResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const collectionRef = adminDb.collection("activityLogs");
    let query: Query<DocumentData> = collectionRef.where("userId", "==", session.user.id);

    if (type) {
      query = query.where("type", "==", type);
    }

    if (description) {
      query = query.where("description", "==", description);
    }

    query = query.orderBy("timestamp", "desc");

    if (startAfter) {
      const startAfterDoc = await collectionRef.doc(startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    query = query.limit(limit);

    const logsSnapshot = await query.get();

    const activities: ActivityLogWithId[] = await Promise.all(
      logsSnapshot.docs.map(async doc => {
        const data = doc.data();
        let userEmail = "";

        try {
          const userRecord = await adminAuth.getUser(data.userId);
          userEmail = userRecord.email ?? "";
        } catch (authError) {
          console.warn(`Failed to fetch email for user ${data.userId}:`, authError);
        }

        return {
          id: doc.id,
          userId: data.userId,
          userEmail,
          type: data.type,
          description: data.description,
          status: data.status,
          timestamp: data.timestamp,
          ipAddress: data.ipAddress,
          location: data.location,
          device: data.device,
          deviceType: data.deviceType,
          metadata: data.metadata
        };
      })
    );

    return { success: true, activities };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error";

    console.error("Error getting user activity logs:", message);
    return { success: false, error: message };
  }
}

export async function logActivity(data: Omit<ActivityLogData, "timestamp">): Promise<LogActivityResult> {
  try {
    const payload: ActivityLogData = {
      ...data,
      timestamp: Timestamp.now()
    };

    const docRef = await adminDb.collection("activityLogs").add(payload);

    return { success: true, activityId: docRef.id };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error logging activity";

    console.error("🔥 Error logging activity:", message); // optional: helpful log
    return { success: false, error: message };
  }
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

export async function getAllProductsFromFirestore(): Promise<
  { success: true; data: Product[] } | { success: false; error: string }
> {
  try {
    const snapshot = await adminDb.collection("products").orderBy("createdAt", "desc").get();

    const products: Product[] = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        image: data.image,
        price: data.price,
        inStock: data.inStock,
        badge: data.badge,
        isFeatured: data.isFeatured ?? false,
        isHero: data.isHero ?? false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });

    // ✅ Use the serializer here
    return { success: true, data: serializeProductArray(products) };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error fetching products";
    return { success: false, error: message };
  }
}

export async function addProductToFirestore(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<{ success: true; id: string; product: SerializedProduct } | { success: false; error: string }> {
  try {
    const now = Timestamp.now();

    const productData = {
      ...data,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await adminDb.collection("products").add(productData);

    const fullProduct: Product = {
      id: docRef.id,
      ...productData
    };

    const serializedProduct = serializeProduct(fullProduct);

    return {
      success: true,
      id: docRef.id,
      product: serializedProduct
    };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error occurred while adding product";

    console.error("Error adding product:", message);
    return { success: false, error: message };
  }
}

export async function getProductByIdFromFirestore(id: string): Promise<GetProductByIdFromFirestoreResult> {
  try {
    const docRef = adminDb.collection("products").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return { success: false, error: "Product not found" };
    }

    const data = doc.data();

    const product: Product = {
      id: doc.id,
      name: data?.name,
      description: data?.description || "",
      image: data?.image,
      price: data?.price,
      inStock: data?.inStock,
      badge: data?.badge || "",
      isFeatured: data?.isFeatured === true,
      createdAt: data?.createdAt,
      updatedAt: data?.updatedAt
    };

    return { success: true, product: serializeProduct(product) };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error fetching product by ID";
    return { success: false, error: message };
  }
}

/**
 * Update a product document in Firestore
 */
type SafeUpdateProductInput = Omit<UpdateProductInput, "id" | "createdAt">;

export async function updateProductInFirestore(
  id: string,
  updatedData: SafeUpdateProductInput
): Promise<UpdateProductResult> {
  try {
    const docRef = adminDb.collection("products").doc(id);

    await docRef.update({
      ...updatedData,
      updatedAt: Timestamp.now()
    });

    const updatedDoc = await docRef.get();
    if (!updatedDoc.exists) {
      return { success: false, error: "Product not found after update" };
    }

    const data = updatedDoc.data()!;
    const fullProduct: Product = {
      id: updatedDoc.id,
      name: data.name,
      description: data.description || "",
      image: data.image,
      price: data.price,
      inStock: data.inStock,
      badge: data.badge || "",
      isFeatured: data.isFeatured === true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };

    return {
      success: true,
      product: serializeProduct(fullProduct)
    };
  } catch (error) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error updating product";
    return { success: false, error: message };
  }
}

export async function deleteProductFromFirestore(
  productId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await adminDb.collection("products").doc(productId).delete();
    return { success: true };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error deleting product";

    console.error("Error deleting product:", message);
    return { success: false, error: message };
  }
}

export async function getFeaturedProductsFromFirestore(): Promise<
  { success: true; data: Product[] } | { success: false; error: string }
> {
  try {
    const snapshot = await adminDb.collection("products").where("isFeatured", "==", true).get();

    const products: Product[] = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        name: data.name,
        description: data.description || "",
        image: data.image,
        price: data.price,
        inStock: data.inStock,
        badge: data.badge || "",
        isFeatured: data.isFeatured === true,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });

    return { success: true, data: serializeProductArray(products) };
  } catch (error) {
    const message =
      isFirebaseError(error) || error instanceof Error ? error.message : "Unknown error fetching featured products";
    return { success: false, error: message };
  }
}

export async function getHeroSlidesFromFirestore(): Promise<
  { success: true; data: HeroSlide[] } | { success: false; error: string }
> {
  try {
    const snapshot = await adminDb.collection("products").where("isHero", "==", true).get();

    const slides: HeroSlide[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        title: data.name,
        description: data.description,
        backgroundImage: data.image,
        cta: "Shop Now",
        ctaHref: `/products/${doc.id}`
      };
    });

    return { success: true, data: slides };
  } catch (error) {
    const message =
      isFirebaseError(error) || error instanceof Error ? error.message : "Unknown error fetching hero slides";
    return { success: false, error: message };
  }
}
