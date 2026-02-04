import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID");

export const alertValidator = z.object({
  productId: objectId,

  type: z.enum([
    "low-stock",
    "out-of-stock",
    "expiry-warning",
    "price-change"
  ]),

  message: z
    .string()
    .min(3, "Alert message must be at least 3 characters")
    .trim(),

  resolved: z.boolean().optional().default(false)
});

export const updateAlertValidator = z.object({
  resolved: z.boolean()
});
