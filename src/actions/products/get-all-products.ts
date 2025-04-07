// src/actions/products/get-all-products.ts
"use server";

import { getAllProducts as getAllProductsFromDB } from "@/firebase/actions";

export async function getAllProducts() {
  return await getAllProductsFromDB();
}
