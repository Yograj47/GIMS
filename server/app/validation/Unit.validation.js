import { z } from "zod";

export const unitSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  shortForm: z.string().min(1, "Short form is required").max(10).trim(),
  unitType: z.enum(['weight', 'volume', 'count', 'pack'], {
    errorMap: () => ({ message: "Type must be weight, volume, count, or pack" })
  }),
  baseUnit: z.boolean().optional(),
  isFractional: z.boolean().optional(),
  isActive: z.boolean().optional(),
});