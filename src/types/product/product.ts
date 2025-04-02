// types/product.ts
import { Timestamp } from "firebase-admin/firestore";
export interface Product {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  inStock: boolean;
  badge?: string;
  isFeatured?: boolean;
  isHero?: boolean;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface SerializedProduct {
  id: string;
  name: string;
  title?: string;
  description?: string;
  image: string;
  price: number;
  inStock: boolean;
  badge?: string;
  isFeatured?: boolean;
  isHero?: boolean;
  createdAt: Timestamp | string;
  updatedAt?: Timestamp | string;
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

export type GetProductByIdFromFirestoreResult = GetProductByIdSuccess | GetProductByIdError;
export type GetProductByIdResponse = GetProductByIdFromFirestoreResult;

// Update product input (only allow partial updates, excluding id/createdAt)
export type UpdateProductInput = Partial<Omit<Product, "id" | "createdAt">>;

// Update result types
export interface UpdateProductSuccess {
  success: true;
  product: SerializedProduct;
}

export interface UpdateProductError {
  success: false;
  error: string;
}

export type UpdateProductResult = UpdateProductSuccess | UpdateProductError;

export interface HeroSlide {
  title: string;
  description: string;
  backgroundImage: string;
  cta?: string;
  ctaHref?: string;
}
