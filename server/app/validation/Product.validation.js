import { z } from "zod";

export const productSchema = z.object({
    name: z
        .string()
        .min(1, "Product name cannot be empty")
        .trim(),

    categoryId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid Category ID format"),

    unitId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid Unit ID format"),

    supplierId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid Supplier ID format")
        .optional()
        .or(z.literal("")),

    quantity: z
        .number()
        .min(0, "Quantity cannot be negative")
        .default(0),

    threshold: z
        .number()
        .min(0, "Threshold cannot be negative")
        .default(0),

    basePrice: z
        .number()
        .min(0.01, "Base price must be greater than zero"),

    sellingPrice: z
        .number()
        .min(0.01, "Selling price must be greater than zero"),

    isActive: z.boolean().default(true),

}).refine((data) => data.sellingPrice >= data.basePrice, {
    message: "Selling price must be greater than or equal to the base price",
    path: ["sellingPrice"], 
});