import { z } from 'zod';

const itemSchema = z.object({
  productName: z.string().optional(),
  productId: z.string().min(1, "Product is required"),
  unitId: z.string().min(1, "Unit is required"),
  unitName: z.string().optional(), 
  multiplier: z.number().min(0.00001, "Invalid multiplier"), 
  
  qty: z.number().min(0.001, "Quantity must be at least 0.001"), 
  rate: z.number().min(0, "Rate cannot be negative"),
  total: z.number()
});

export const transactionSchema = z.object({
  transactionType: z.enum(['Purchase', 'Sale', 'Return', 'Damage', 'Fixed', 'Adjustment']),
  items: z.array(itemSchema).min(1, "Add at least one item"),
  grandTotal: z.number(),
  isPaid: z.boolean().default(false),
  partyDetails: z.object({
    name: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal(""))
  }).optional().default({ name: "", phone: "" }),
  notes: z.string().optional().or(z.literal(""))
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type Item = z.infer<typeof itemSchema>;

export type TransactionData = Omit<TransactionFormData, 'items'> & {
  _id: string;
  items: Array<Omit<Item, 'productId' | 'unitId'> & {
    productId: { _id: string; name: string };
    unitId: { _id: string; name: string };
  }>;
  createdAt: string;
  updatedAt: string;
};

export interface TransactionAPIResponse {
  status: string;
  data: TransactionData | TransactionData[] | null;
  message?: string;
}

export const creditTransactionSchema = z.object({
  isPaid: z.boolean(),
  notes: z.string().optional().or(z.literal("")), 
});

export type CreditTransactionInput = z.infer<typeof creditTransactionSchema>;