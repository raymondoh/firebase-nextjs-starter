"use server";

// ================= Imports =================
import { getProductById as getProductByIdFromDb } from "@/firebase/actions";
import type { GetProductByIdResponse } from "@/types/product";

// ================= Get Product By ID =================

/**
 * Action to fetch a single product by ID
 */
export async function getProductById(id: string): Promise<GetProductByIdResponse> {
  return await getProductByIdFromDb(id);
}
