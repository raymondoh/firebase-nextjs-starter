//src/actions/products/add-product.ts
"use server";

import { revalidatePath } from "next/cache";
import { type CreateProductInput, createProductSchema } from "@/schemas/product/product";
import { addProductToFirestore } from "@/firebase/actions";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";

export async function addProduct(
  data: CreateProductInput
): Promise<{ success: true; id: string } | { success: false; error: string }> {
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
    const result = await addProductToFirestore(validated.data);

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
