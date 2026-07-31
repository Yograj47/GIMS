import { z } from "zod";

export const createSupplierSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Supplier name must be at least 2 characters")
        .max(100, "Supplier name is too long"),

    phone: z
        .string()
        .trim()
        .min(1, "Phone number is required"),

    email: z
        .email("Invalid email address")
        .trim()
        .toLowerCase()
        .optional()
        .or(z.literal("")),

    address: z
        .string()
        .trim()
        .min(2, "Address is required")
        .max(255, "Address is too long"),

    notes: z
        .string()
        .trim()
        .max(500, "Notes cannot exceed 500 characters")
        .optional()
        .or(z.literal("")),

    isActive: z
        .boolean()
        .optional(),
});

export const updateSupplierSchema =
    createSupplierSchema.partial();