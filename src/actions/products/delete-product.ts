"use server";

import { revalidatePath } from "next/cache";
import { deleteProductFromFirestore } from "@/firebase/admin/products";
//import type { Product } from "@/types/product";

export async function deleteProduct(productId: string): Promise<{ success: true } | { success: false; error: string }> {
  const result = await deleteProductFromFirestore(productId);

  if (result.success) {
    revalidatePath("/dashboard/admin/products"); // update if your path is different
  }

  return result;
}
