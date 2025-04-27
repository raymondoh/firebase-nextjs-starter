// // src/actions/client/products.ts
// import type { GetAllProductsResult } from "@/types/product/result";

// export async function fetchAllProductsClient(): Promise<GetAllProductsResult> {
//   try {
//     const res = await fetch("/api/products");
//     console.log("[fetchAllProductsClient] Result!!!:", res);

//     return await res.json();
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     return { success: false, error: "Failed to fetch products" };
//   }
// }
"use client";

// ================= Imports =================
import type { GetAllProductsResult } from "@/types/product/result";

// ================= Client Actions =================

/**
 * Fetch all products from the API (client-side)
 */
export async function fetchAllProductsClient(): Promise<GetAllProductsResult> {
  try {
    const response = await fetch("/api/products");

    if (!response.ok) {
      console.error("[fetchAllProductsClient] Failed API response:", response.statusText);
      return { success: false, error: "Failed to fetch products" };
    }

    const data: GetAllProductsResult = await response.json();
    return data;
  } catch (error) {
    console.error("[fetchAllProductsClient] Error:", error);
    return { success: false, error: "Unexpected client error occurred." };
  }
}
