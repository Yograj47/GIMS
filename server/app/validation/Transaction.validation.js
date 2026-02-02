import { z } from 'zod';

export const ItemSchema = z.object({
    productId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID format'),
    unitId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Unit ID format'),
    qty: z.number().min(1),
    rate: z.number().min(0),
    total: z.number()
});

export const transactionSchema = z.object({
    transactionType: z.enum(['Purchase', 'Sale', 'Return', 'Damage', 'Fixed']),
    items: z.array(ItemSchema),
    grandTotal: z.number(),
    isPaid: z.boolean().default(false),
    partyDetails: z.object({ 
        name: z.string().optional(), 
        phone: z.string().optional()
    }),
    notes: z.string().optional() 
});