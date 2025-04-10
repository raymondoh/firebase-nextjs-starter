"use server";

import { revalidatePath } from "next/cache";
import { deleteProduct as deleteProductFromDb } from "@/firebase/actions";
import type { DeleteProductResult } from "@/types/product/result";

export async function deleteProduct(productId: string): Promise<DeleteProductResult> {
  const result = await deleteProductFromDb(productId);

  if (result.success) {
    revalidatePath("/dashboard/admin/products"); // update this path if needed
  }

  return result;
}
