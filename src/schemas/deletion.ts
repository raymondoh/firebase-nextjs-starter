import { z } from "zod";

// Deletion request schema
export const deletionRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  email: z.string().email("Valid email is required"),
  requestedAt: z.date(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  completedAt: z.date().nullable(),
  reason: z.string().optional()
});

// Deletion request type
export type DeletionRequest = z.infer<typeof deletionRequestSchema>;
