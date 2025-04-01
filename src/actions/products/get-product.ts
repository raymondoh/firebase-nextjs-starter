"use server";

import { getProductByIdFromFirestore } from "@/firebase/admin/products";
import type { GetProductByIdResponse } from "@/types/product";

/**
 * Action to fetch a single product by ID
 */
export async function getProductById(id: string): Promise<GetProductByIdResponse> {
  return await getProductByIdFromFirestore(id);
}
