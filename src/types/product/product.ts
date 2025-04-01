// types/product.ts
export interface Product {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  inStock: boolean;
  badge?: string;
  createdAt: string; // ISO string if serialized
}

// get product by ID
export interface GetProductByIdSuccess {
  success: true;
  product: Product;
}
export interface GetProductByIdError {
  success: false;
  error: string;
}
export type GetProductByIdResult = GetProductByIdSuccess | GetProductByIdError;
export type GetProductByIdResponse = GetProductByIdResult;

// Update product input (only allow partial updates, excluding id/createdAt)
export type UpdateProductInput = Partial<Omit<Product, "id" | "createdAt">>;

// Update result types
export interface UpdateProductSuccess {
  success: true;
}

export interface UpdateProductError {
  success: false;
  error: string;
}

export type UpdateProductResult = UpdateProductSuccess | UpdateProductError;
