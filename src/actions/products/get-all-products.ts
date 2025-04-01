// src/actions/products/get-all-products.ts
"use server";

import { getAllProductsFromFirestore } from "@/firebase/admin/products";

export async function getAllProducts() {
  return await getAllProductsFromFirestore();
}
