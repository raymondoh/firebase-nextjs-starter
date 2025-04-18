//src/actions/products/add-product.ts
"use server";

import { revalidatePath } from "next/cache";
import { type CreateProductInput, createProductSchema } from "@/schemas/products/product";
import { addProduct as addProductToDb } from "@/firebase/actions";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import type { AddProductResult } from "@/types/product/result";

export async function addProduct(data: CreateProductInput): Promise<AddProductResult> {
  try {
    // ✅ Step 1: Validate incoming data with the dedicated creation schema
    const validated = createProductSchema.safeParse(data);

    if (!validated.success) {
      return {
        success: false,
        error: "Invalid product data: " + validated.error.message
      };
    }

    // ✅ Step 2: Call Firebase function with validated data
    const result = await addProductToDb(validated.data);

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
