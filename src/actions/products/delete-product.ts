"use server";

import { revalidatePath } from "next/cache";
import { deleteProduct as deleteProductFromDb } from "@/firebase/actions";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import type { DeleteProductResult } from "@/types/product/result";

export async function deleteProduct(productId: string): Promise<DeleteProductResult> {
  try {
    const result = await deleteProductFromDb(productId); // ✅ Uses correct version that also deletes image

    if (!result.success) {
      return result;
    }

    // Optionally revalidate the product page
    revalidatePath("/admin/products");

    return { success: true };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unexpected error occurred while deleting product";

    console.error("❌ Unhandled error in deleteProduct action:", message);
    return { success: false, error: message };
  }
}
