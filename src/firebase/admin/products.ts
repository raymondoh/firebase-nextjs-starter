// src/firebase/admin/products.ts

import { Timestamp } from "firebase-admin/firestore";
import { adminDb, adminStorage } from "@/firebase/admin/firebase-admin-init";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { serializeProduct, serializeProductArray } from "@/utils/serializeProduct";
import { productSchema } from "@/schemas/product";

import type { Product, UpdateProductInput, HeroSlide, SerializedProduct } from "@/types/product";

import type { GetProductByIdFromFirestoreResult, UpdateProductResult } from "@/types/product";

// ================= Helpers =================

/** Centralized error formatter */
function formatError(error: unknown): string {
  if (isFirebaseError(error)) return firebaseError(error);
  if (error instanceof Error) return error.message;
  return "Unknown error occurred";
}

/** Centralized document-to-product mapper */
function mapDocToProduct(doc: FirebaseFirestore.DocumentSnapshot): Product {
  const data = doc.data() ?? {};
  return {
    id: doc.id,
    name: data?.name,
    description: data?.description || "",
    details: data?.details || "",
    dimensions: data?.dimensions || "",
    material: data?.material || "",
    color: data?.color || "",
    stickySide: data?.stickySide || undefined,
    category: data?.category || "",
    image: data?.image || "/placeholder.svg",
    price: data?.price,
    inStock: data?.inStock ?? true,
    badge: data?.badge || "",
    isFeatured: data?.isFeatured ?? false,
    isHero: data?.isHero ?? false,
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt
  };
}

// ================= Product Queries =================

/** Fetch all products */
export async function getAllProducts() {
  try {
    const snapshot = await adminDb.collection("products").orderBy("createdAt", "desc").get();
    const products = snapshot.docs.map(mapDocToProduct);
    return { success: true as const, data: serializeProductArray(products) };
  } catch (error) {
    return { success: false as const, error: formatError(error) };
  }
}

/** Fetch a product by ID */
export async function getProductById(id: string): Promise<GetProductByIdFromFirestoreResult> {
  try {
    const doc = await adminDb.collection("products").doc(id).get();
    if (!doc.exists) return { success: false as const, error: "Product not found" };

    const product = mapDocToProduct(doc);
    return { success: true as const, product: serializeProduct(product) };
  } catch (error) {
    return { success: false as const, error: formatError(error) };
  }
}

/** Fetch featured products */
export async function getFeaturedProducts() {
  try {
    const snapshot = await adminDb.collection("products").where("isFeatured", "==", true).get();
    const products = snapshot.docs.map(mapDocToProduct);
    return { success: true as const, data: serializeProductArray(products) };
  } catch (error) {
    return { success: false as const, error: formatError(error) };
  }
}

/** Fetch hero slides */
export async function getHeroSlidesFromFirestore() {
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
    return { success: true as const, data: slides };
  } catch (error) {
    return { success: false as const, error: formatError(error) };
  }
}

// ================= Product Mutations =================

/** Add a new product */
export async function addProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">) {
  try {
    const parsed = productSchema.omit({ id: true, createdAt: true, updatedAt: true }).safeParse(data);
    if (!parsed.success) {
      console.error("❌ Invalid product data:", parsed.error.flatten());
      return { success: false as const, error: "Invalid product data" };
    }

    const now = Timestamp.now();
    const productData = { ...parsed.data, createdAt: now, updatedAt: now };
    const docRef = await adminDb.collection("products").add(productData);

    const fullProduct: Product = { id: docRef.id, ...productData };
    return { success: true as const, id: docRef.id, product: serializeProduct(fullProduct) };
  } catch (error) {
    return { success: false as const, error: formatError(error) };
  }
}

/** Update a product */
export async function updateProduct(
  id: string,
  updatedData: Omit<UpdateProductInput, "id" | "createdAt">
): Promise<UpdateProductResult> {
  try {
    const parsed = productSchema.partial().omit({ id: true, createdAt: true }).safeParse(updatedData);
    if (!parsed.success) {
      console.error("❌ Invalid updated product data:", parsed.error.flatten());
      return { success: false as const, error: "Invalid product update data" };
    }

    const docRef = adminDb.collection("products").doc(id);
    await docRef.update({ ...parsed.data, updatedAt: Timestamp.now() });

    const updatedDoc = await docRef.get();
    if (!updatedDoc.exists) return { success: false as const, error: "Product not found after update" };

    const product = mapDocToProduct(updatedDoc);
    return { success: true as const, product: serializeProduct(product) };
  } catch (error) {
    return { success: false as const, error: formatError(error) };
  }
}

/** Delete a product and its image */
export async function deleteProduct(productId: string) {
  try {
    const docRef = adminDb.collection("products").doc(productId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false as const, error: "Product not found" };
    }

    const data = docSnap.data();
    const imageUrl = data?.image;

    await docRef.delete();

    if (imageUrl) await deleteProductImage(imageUrl);

    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: formatError(error) };
  }
}

/** Delete a product image from Storage */
export async function deleteProductImage(imageUrl: string) {
  try {
    const bucket = adminStorage.bucket();
    const url = new URL(imageUrl);
    const fullPath = url.pathname.slice(1);
    const storagePath = fullPath.replace(`${bucket.name}/`, "");

    await bucket.file(storagePath).delete();

    return { success: true as const };
  } catch (error) {
    console.error("❌ Error deleting product image:", error);
    return { success: false as const, error: formatError(error) };
  }
}
