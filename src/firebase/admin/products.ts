// src/firebase/admin/products/products.ts
import { Timestamp } from "firebase-admin/firestore";
import { adminDb, adminStorage } from "./firebase-admin-init";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import type {
  GetProductByIdFromFirestoreResult,
  UpdateProductInput,
  UpdateProductResult,
  Product,
  SerializedProduct,
  HeroSlide
} from "@/types/product";
import { serializeProduct, serializeProductArray } from "@/utils/serializeProduct";
import { productSchema } from "@/schemas/products/product";

export async function getAllProducts(): Promise<
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
        image: data.image || "/placeholder.svg",
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

export async function addProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<{ success: true; id: string; product: SerializedProduct } | { success: false; error: string }> {
  try {
    const parsed = productSchema.safeParse(data);

    if (!parsed.success) {
      console.error("❌ Invalid product data:", parsed.error.flatten());
      return { success: false, error: "Invalid product data" };
    }

    const now = Timestamp.now();
    const productData = {
      ...parsed.data,
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

export async function getProductById(id: string): Promise<GetProductByIdFromFirestoreResult> {
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
      image: data?.image || "/placeholder.svg",
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

export async function updateProduct(id: string, updatedData: SafeUpdateProductInput): Promise<UpdateProductResult> {
  try {
    const parsed = productSchema.partial().safeParse(updatedData); // allow partial updates

    if (!parsed.success) {
      console.error("❌ Invalid updated product data:", parsed.error.flatten());
      return { success: false, error: "Invalid product update data" };
    }

    const docRef = adminDb.collection("products").doc(id);

    await docRef.update({
      ...parsed.data,
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
      image: data.image || "/placeholder.svg",
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

    console.error("Error updating product:", message);
    return { success: false, error: message };
  }
}

export async function deleteProduct(productId: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const docRef = adminDb.collection("products").doc(productId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { success: false, error: "Product not found" };
    }

    const data = docSnap.data();
    const imageUrl = data?.image;
    console.log("🧼 !!!!!!!Attempting to delete PRODUCT!!!!:", imageUrl);

    // Delete product from Firestore
    await docRef.delete();

    // Delete image if present
    if (imageUrl) {
      await deleteProductImage(imageUrl);
    }

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

// Utility function
export async function deleteProductImage(
  imageUrl: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const bucket = adminStorage.bucket();

    // 🔥 Use URL parsing to get the correct file path
    const url = new URL(imageUrl);
    const fullPath = url.pathname.slice(1); // e.g., "my-bucket-name/products/product.jpg"

    // Remove bucket prefix from path
    const bucketName = adminStorage.bucket().name; // "my-firebase-playground-5db22"
    const storagePath = fullPath.replace(`${bucketName}/`, ""); // ✅ just "products/product.jpg"
    console.log("🧼 *****Attempting to delete image*****:", storagePath);
    const file = bucket.file(storagePath);
    await file.delete();

    return { success: true };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error deleting image";

    console.error("❌ Error deleting image:", message);
    return { success: false, error: message };
  }
}

export async function getFeaturedProducts(): Promise<
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
        image: data.image || "/placeholder.svg",
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
