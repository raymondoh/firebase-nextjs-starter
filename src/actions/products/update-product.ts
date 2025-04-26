// "use server";

// import { revalidatePath } from "next/cache";
// import { type UpdateProductInput, updateProductSchema } from "@/schemas/products/product";
// import { updateProduct as updateProductInDb } from "@/firebase/actions";
// import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
// import type { UpdateProductResult } from "@/types/product";

// /**
//  * Server action to update a product
//  */
// export async function updateProduct(productId: string, data: UpdateProductInput): Promise<UpdateProductResult> {
//   try {
//     const validated = updateProductSchema.safeParse(data);

//     if (!validated.success) {
//       return { success: false, error: "Invalid product data: " + validated.error.message };
//     }

//     const result = await updateProductInDb(productId, validated.data);

//     if (result.success) {
//       revalidatePath("/dev/products");
//     }

//     return result;
//   } catch (error: unknown) {
//     const message = isFirebaseError(error)
//       ? firebaseError(error)
//       : error instanceof Error
//       ? error.message
//       : "Unknown error updating product";

//     console.error("Unhandled error in updateProduct action:", message);
//     return { success: false, error: message };
//   }
// }
"use server";

import { revalidatePath } from "next/cache";
import { type UpdateProductInput, updateProductSchema } from "@/schemas/products/product";
import { updateProduct as updateProductInDb } from "@/firebase/actions";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";
import { logger } from "@/utils/logger";
import type { UpdateProductResult } from "@/types/product";

/**
 * Server action to update a product
 */
export async function updateProduct(productId: string, data: UpdateProductInput): Promise<UpdateProductResult> {
  try {
    const validated = updateProductSchema.safeParse(data);

    if (!validated.success) {
      logger({
        type: "warn",
        message: "Invalid product data during updateProduct",
        metadata: { productId, error: validated.error.message },
        context: "products"
      });
      return { success: false, error: "Invalid product data: " + validated.error.message };
    }

    const result = await updateProductInDb(productId, validated.data);

    if (!result.success) {
      logger({
        type: "error",
        message: "Failed to update product",
        metadata: { productId, error: result.error },
        context: "products"
      });
    } else {
      logger({
        type: "info",
        message: "Product updated successfully",
        metadata: { productId },
        context: "products"
      });
    }

    if (result.success) {
      revalidatePath("/dev/products");
    }

    return result;
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error updating product";

    logger({
      type: "error",
      message: "Unhandled exception in updateProduct",
      metadata: { productId, error: message },
      context: "products"
    });

    return { success: false, error: message };
  }
}
