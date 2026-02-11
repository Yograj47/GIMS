import { z } from "zod";

export const supplierSchema = z.object({
    name: z
        .string()
        .min(1, "Supplier name cannot be empty")
        .trim(),
    phone: z
        .string()
        .min(1, "Supplier phone cannot be empty")
        .trim(),
    email: z
        .string()
        .optional(),
    address: z
        .string()
        .min(1, "Supplier address cannot be empty")
        .trim(),
    notes: z
        .string()
        .optional(),
    isActive: z
        .boolean()
        .optional()
});