import { z } from 'zod';

export const ItemSchema = z.object({
    productId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID format'),
    unitId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Unit ID format'),
    qty: z
        .number(),
    rate: z
        .number(),
    total: z
        .number()
});

export const transactionSchema = z.object({
    transactionType: z
        .enum['Purchase', 'Sale', 'Return', 'Damage', 'Fixed'],
    items: [ItemSchema],
    grandTotal: z
        .number(),
    isPaid: z
        .boolean(),
    partyDetails: {
        name: z.string,
        phone: z.string
    },
    notes: z
        .string()
})
