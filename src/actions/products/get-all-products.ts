// src/actions/products/get-all-products.ts
"use server";

import { getAllProducts as getAllProductsFromDB } from "@/firebase/actions";
import type { GetAllProductsResult } from "@/types/product/result";

export async function getAllProducts(): Promise<GetAllProductsResult> {
  return await getAllProductsFromDB();
}
