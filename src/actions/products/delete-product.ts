"use server";

// ================= Imports =================
import { revalidatePath } from "next/cache";
import { deleteProduct as deleteProductFromDb } from "@/firebase/actions";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { logger } from "@/utils/logger";
import type { DeleteProductResult } from "@/types/product/result";

// ================= Delete Product =================

/**
 * Delete a product by ID
 */
export async function deleteProduct(productId: string): Promise<DeleteProductResult> {
  try {
    // ✅ Step 1: Call Firebase function
    const result = await deleteProductFromDb(productId);

    if (!result.success) {
      logger({
        type: "error",
        message: "Failed to delete product",
        metadata: { productId, error: result.error },
        context: "products"
      });
      return result;
    }

    // ✅ Step 2: Revalidate products page cache
    revalidatePath("/admin/products");

    logger({
      type: "info",
      message: "Product deleted successfully",
      metadata: { productId },
      context: "products"
    });

    return { success: true };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unexpected error occurred while deleting product";

    logger({
      type: "error",
      message: "Unhandled exception in deleteProduct action",
      metadata: { productId, error: message },
      context: "products"
    });

    return { success: false, error: message };
  }
}
