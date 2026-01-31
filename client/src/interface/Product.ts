import { z } from "zod"

export const productSchema = z.object({
    name: z
        .string()
        .min(1, "Product name cannot be empty")
        .trim(),

    categoryId: z.string(),
    unitId: z.string(),
    supplierId: z.string(),
    quantity: z
        .coerce.number()
        .min(0, "Quantity cannot be negative")
        .default(0),

    threshold: z
        .coerce.number()
        .min(0, "Threshold cannot be negative")
        .default(0),

    basePrice: z
        .coerce.number()
        .min(0.01, "Base price must be greater than zero"),

    sellingPrice: z
        .coerce.number()
        .min(0.01, "Selling price must be greater than zero"),

    isActive: z.boolean().default(true),
})
    .refine((data) => data.sellingPrice >= data.basePrice, {
        message: "Selling price must be greater than or equal to the base price",
        path: ["sellingPrice"],
    });


export type ProductFormData = z.infer<typeof productSchema>;

export interface ProductAPIResponse {
    _id: string;
    name: string;
    quantity: number;
    threshold: number;
    basePrice: number;
    sellingPrice: number;
    category: { _id: string; name: string };
    unit: { _id: string; name: string };
    supplier: { _id: string; name: string };
    isActive: boolean;
    createdAt: string;
}