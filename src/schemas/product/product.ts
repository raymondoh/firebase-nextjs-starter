// src/schemas/product.ts
import { z } from "zod";

// Base schema
export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters").optional(),
  image: z.string().url("Must be a valid image URL"),
  price: z.number().positive("Price must be a positive number"),
  inStock: z.boolean(),
  badge: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isHero: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Creation schema (strictly required fields only)
// Using object syntax instead of array syntax
export const createProductSchema = productSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .strict();

// Update schema (all fields optional for partial updates)
export const updateProductSchema = productSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .partial()
  .strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
