import { z } from "zod";

// Schema for data export
export const exportDataSchema = z.object({
  format: z.enum(["json", "csv"])
});
