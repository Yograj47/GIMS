import { z } from 'zod';

export const ItemSchema = z.object({
    productId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID format'),
    unitId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Unit ID format'),
    unitName: z.string().optional(), // Added for easier UI rendering
    
    // Changed: min(0.001) allows for 0.5kg or 250gm sales
    qty: z.number().min(0.001, "Quantity must be greater than zero"),
    
    // Added: We must send the multiplier from the frontend to lock it in
    multiplier: z.number().min(0.001), 
    
    rate: z.number().min(0),
    total: z.number()
});

export const transactionSchema = z.object({
    // Updated enum to match your 'Adjustment'/ 'Fixed' logic
    transactionType: z.enum(['Purchase', 'Sale', 'Return', 'Damage', 'Fixed', 'Adjustment']),
    
    items: z.array(ItemSchema).min(1, "At least one item is required"),
    grandTotal: z.number().min(0),
    isPaid: z.boolean().default(false),
    
    partyDetails: z.object({ 
        name: z.string().optional().default(""), 
        phone: z.string().optional().default("")
    }).default({}),
    
    notes: z.string().optional().default("")
});