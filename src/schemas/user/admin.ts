//src/schemas/user/index.ts
import { z } from "zod";

// Schemas: user search and user role update

// User search schema
export const userSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0)
});

// User role update schema
export const userRoleUpdateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["user", "admin"], {
    errorMap: () => ({ message: "Role must be either 'user' or 'admin'" })
  })
});

// Types derived from the schemas
export type UserSearchValues = z.infer<typeof userSearchSchema>;
export type UserRoleUpdateValues = z.infer<typeof userRoleUpdateSchema>;
