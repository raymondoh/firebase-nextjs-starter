// src/actions/products/get-all-products.ts
"use server";

import { getAllProductsFromFirestore } from "@/firebase/actions";

export async function getAllProducts() {
  return await getAllProductsFromFirestore();
}
