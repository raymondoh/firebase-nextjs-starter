import { z } from "zod";

// Schema for data export
export const exportDataSchema = z.object({
  format: z.enum(["json", "csv"])
});

// Schema for account deletion
export const accountDeletionSchema = z.object({
  immediateDelete: z.boolean().default(true)
});

// Schema for deletion request
export const deletionRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  email: z.string().email("Valid email is required"),
  requestedAt: z.date(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  completedAt: z.date().nullable(),
  reason: z.string().optional()
});
