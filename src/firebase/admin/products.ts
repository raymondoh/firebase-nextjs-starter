// src/firebase/admin/products.ts
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./index";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import type {
  GetProductByIdFromFirestoreResult,
  UpdateProductInput,
  UpdateProductResult,
  Product,
  SerializedProduct
} from "@/types/product";
import { serializeProduct, serializeProductArray } from "@/utils/serializeProduct";

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
