// types/product/result.ts

import type { Product } from "./product";

export type GetAllProductsResult = { success: true; data: Product[] } | { success: false; error: string };

export type AddProductResult = { success: true; id: string } | { success: false; error: string };
export type DeleteProductResult = { success: true } | { success: false; error: string };
