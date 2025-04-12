// "use server";

// import { revalidatePath } from "next/cache";
// import { deleteProduct as deleteProductFromDb } from "@/firebase/actions";
// import type { DeleteProductResult } from "@/types/product/result";

// export async function deleteProduct(productId: string): Promise<DeleteProductResult> {
//   const result = await deleteProductFromDb(productId);

//   if (result.success) {
//     revalidatePath("/dashboard/admin/products"); // update this path if needed
//   }

//   return result;
// }
"use server";

import { revalidatePath } from "next/cache";
import { deleteProduct as deleteProductFromDb } from "@/firebase/actions";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import type { DeleteProductResult } from "@/types/product/result";

export async function deleteProduct(productId: string): Promise<DeleteProductResult> {
  try {
    const result = await deleteProductFromDb(productId);

    if (result.success) {
      revalidatePath("/dashboard/admin/products");
    }

    return result;
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? firebaseError(error)
      : error instanceof Error
      ? error.message
      : "Unexpected error occurred while deleting product";

    console.error("Unhandled error in deleteProduct action:", message);
    return { success: false, error: message };
  }
}
