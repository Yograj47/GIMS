import { z } from 'zod';

const itemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  unitId: z.string().min(1, "Unit is required"), 
  qty: z.number().min(1),
  rate: z.number().min(0),
  total: z.number()
});

export const transactionSchema = z.object({
  transactionType: z.enum(['Purchase', 'Sale', 'Return', 'Damage', 'Fixed']),
  items: z.array(itemSchema).min(1, "Add at least one item"),
  grandTotal: z.number(),
  isPaid: z.boolean().default(false),
  partyDetails: z.object({
    name: z.string().optional(),
    phone: z.string().optional()
  }),
  notes: z.string().optional()
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type Item = z.infer<typeof itemSchema>;