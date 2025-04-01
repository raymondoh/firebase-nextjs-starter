"use server";

import { revalidatePath } from "next/cache";
//import { adminDb } from "@/firebase/admin";
//import { Timestamp } from "firebase-admin/firestore";
import { addProductToFirestore } from "@/firebase/admin/products"; // renamed for clarity
import type { Product } from "@/types/product";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";

export async function addProduct(
  data: Omit<Product, "id" | "createdAt">
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const result = await addProductToFirestore(data);

    if (result.success) {
      revalidatePath("/dev/products");
    }

    return result;
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error occurred while adding product";

    console.error("Unhandled error in addProduct action:", message);
    return { success: false, error: message };
  }
}
