import { z } from "zod";

// 1. Zod Schema for Form Validation (Data going TO backend)
export const productSchema = z.object({
    name: z.string().min(1, "Product name cannot be empty").trim(),
    categoryId: z.string(),
    unitId: z.string(),
    supplierId: z.string(),
    quantity: z.coerce.number().min(0).default(0),
    threshold: z.coerce.number().min(0).default(0),
    basePrice: z.coerce.number().min(0.01),
    sellingPrice: z.coerce.number().min(0.01),
    isActive: z.boolean().default(true),
})
    .refine((data) => data.sellingPrice >= data.basePrice, {
        message: "Selling price must be greater than or equal to the base price",
        path: ["sellingPrice"],
    });

export type ProductFormData = z.infer<typeof productSchema>;

// 2. Individual Product Data Structure (Nested inside the "data" field)
export interface ProductData {
    _id: string;
    name: string;
    quantity: number;
    threshold: number;
    basePrice: number;
    sellingPrice: number;
    category: { _id: string; name: string };
    unit: { _id: string; name: string; shortForm?: string };
    supplier: { _id: string; name: string };
    isActive: boolean;
    createdAt: string;
}

export interface ProductAPIResponse {
    status: string; 
    data: ProductData | ProductData[]; 
}