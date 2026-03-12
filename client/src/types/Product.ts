import { z } from "zod";
import type { PaginationMetadata } from "./Pagination";

export const productSchema = z.object({
    name: z.string().min(1, "Product name cannot be empty").trim(),
    categoryId: z.string(),
    unitId: z.string(),
    supplierId: z.string().optional(),
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
    meta?: PaginationMetadata;
}