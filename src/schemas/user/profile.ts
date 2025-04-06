//src/schemas/user/index.ts
import { z } from "zod";

// Profile update schema
export const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional()
  // We don't validate photo here since it's a File object
  // and will be handled separately
});

// Types derived from the schemas
export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;
