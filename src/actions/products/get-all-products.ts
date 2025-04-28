"use server";

// ================= Imports =================
import { getAllProducts as getAllProductsFromDB } from "@/firebase/actions";
import type { GetAllProductsResult } from "@/types/product/result";

// ================= Get All Products =================

/**
 * Fetch all products from the database
 */
export async function getAllProducts(): Promise<GetAllProductsResult> {
  return await getAllProductsFromDB();
}
