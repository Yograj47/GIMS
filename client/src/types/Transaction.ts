import { z } from 'zod';

const itemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  unitId: z.string().min(1, "Unit is required"),
  qty: z.number().min(1, "Quantity must be at least 1"),
  rate: z.number().min(0, "Rate cannot be negative"),
  total: z.number()
});

export const transactionSchema = z.object({
  transactionType: z.enum(['Purchase', 'Sale', 'Return', 'Damage', 'Fixed']),
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
  isPaid: z.boolean().default(false),
});

export type CreditTransactionInput = z.infer<typeof creditTransactionSchema>;