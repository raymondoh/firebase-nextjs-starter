"use server";

import { revalidatePath } from "next/cache";
import type { UpdateProductInput, UpdateProductResult } from "@/types/product";
import { updateProductInFirestore } from "@/firebase/actions";

/**
 * Server action to update a product
 */
export async function updateProduct(productId: string, data: UpdateProductInput): Promise<UpdateProductResult> {
  const result = await updateProductInFirestore(productId, data);

  if (result.success) {
    revalidatePath("/dev/products"); // Adjust this to match wherever you're showing products
  }

  return result;
}
