import { z } from "zod";

export const stockSchema = z.object({
  productId: z.string(),
  performedBy: z.string(),
  quantity: z.coerce.number()
    .min(0, "Quantity cannot be negative")
    .default(0),
  movementType: z.string(),
  reason: z.string(),
  oldQuantity: z.coerce.number()
    .min(0, "Old quantity cannot be negative")
    .default(0),
  newQuantity: z.coerce.number()
    .min(0, "new quantity cannot be negative")
    .default(0),
  notes: z.string().optional()
})

export type StockFormData = z.infer<typeof stockSchema>