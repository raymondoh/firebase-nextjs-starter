// src/actions/client/products.ts
import type { GetAllProductsResult } from "@/types/product/result";

export async function fetchAllProductsClient(): Promise<GetAllProductsResult> {
  try {
    const res = await fetch("/api/products");
    console.log("[fetchAllProductsClient] Result!!!:", res);

    return await res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}
