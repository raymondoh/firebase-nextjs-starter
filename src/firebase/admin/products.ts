// src/firebase/admin/products.ts
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./index";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import type { GetProductByIdResult, UpdateProductInput, UpdateProductResult, Product } from "@/types/product";

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
        createdAt:
          data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString()
      };
    });

    return { success: true, data: products };
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
  data: Omit<Product, "id" | "createdAt">
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const docRef = await adminDb.collection("products").add({
      ...data,
      createdAt: Timestamp.now()
    });

    return { success: true, id: docRef.id };
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

export async function getProductByIdFromFirestore(productId: string): Promise<GetProductByIdResult> {
  try {
    const doc = await adminDb.collection("products").doc(productId).get();

    if (!doc.exists) {
      return { success: false, error: "Product not found" };
    }

    const data = doc.data();
    if (!data) {
      return { success: false, error: "No product data found" };
    }

    const product: Product = {
      id: doc.id,
      name: data.name,
      description: data.description,
      image: data.image,
      price: data.price,
      inStock: data.inStock,
      badge: data.badge,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
    };

    return { success: true, product };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error occurred while fetching product";

    console.error("Error fetching product by ID:", message);
    return { success: false, error: message };
  }
}

/**
 * Update a product document in Firestore
 */
export async function updateProductInFirestore(
  productId: string,
  data: UpdateProductInput
): Promise<UpdateProductResult> {
  try {
    const docRef = adminDb.collection("products").doc(productId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return { success: false, error: "Product not found" };
    }

    await docRef.update({
      ...data,
      updatedAt: Timestamp.now()
    });

    return { success: true };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error occurred while updating product";

    console.error("Error updating product:", message);
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
