import { z } from 'zod';

export const StockMovementSchema = z.object({
    productId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID format'),
    performedBy: z.
        string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid User ID format'),
    quantity: z
        .number()
        .min(0, 'Quantity must be a positive number'),
    movementType: z
        .enum(['IN', 'OUT']),
    oldQuantity: z
        .number(),
    newQuantity: z
        .number(),
    notes: z
        .string()
        .optional(),
});

