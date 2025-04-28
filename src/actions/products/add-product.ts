"use server";

// ================= Imports =================
import { revalidatePath } from "next/cache";
import { addProduct as addProductToDb } from "@/firebase/actions";
import { createProductSchema, type CreateProductInput } from "@/schemas/product/product";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { logger } from "@/utils/logger";
import type { AddProductResult } from "@/types/product/result";

// ================= Add Product =================

/**
 * Add a new product
 */
export async function addProduct(data: CreateProductInput): Promise<AddProductResult> {
  try {
    // Step 1: Validate incoming data
    const validated = createProductSchema.safeParse(data);

    if (!validated.success) {
      logger({
        type: "warn",
        message: "Invalid product data during addProduct",
        metadata: { error: validated.error.flatten() },
        context: "products"
      });
      return {
        success: false,
        error: "Invalid product data: " + validated.error.message
      };
    }

    // Step 2: Save to database
    const result = await addProductToDb(validated.data);

    if (result.success) {
      revalidatePath("/dev/products");

      logger({
        type: "info",
        message: `Product added successfully`,
        metadata: { productName: validated.data.name },
        context: "products"
      });
    } else {
      logger({
        type: "error",
        message: "Failed to add product",
        metadata: { error: result.error },
        context: "products"
      });
    }

    return result;
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unknown error occurred while adding product";

    logger({
      type: "error",
      message: "Unhandled exception in addProduct action",
      metadata: { error: message },
      context: "products"
    });

    return { success: false, error: message };
  }
}
