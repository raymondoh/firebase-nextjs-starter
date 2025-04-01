// src/utils/serializeProduct.ts

import type { Product, SerializedProduct } from "@/types/product";
import { parseServerDate } from "@/utils/date-server";

export function serializeProduct(product: Product): SerializedProduct {
  return {
    ...product,
    createdAt: parseServerDate(product.createdAt)?.toISOString() ?? new Date().toISOString(),
    updatedAt: parseServerDate(product.updatedAt)?.toISOString() ?? new Date().toISOString()
  };
}

export function serializeProductArray(products: Product[]): SerializedProduct[] {
  return products.map(serializeProduct);
}
