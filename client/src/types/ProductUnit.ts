import { z } from "zod";
import type { PaginationMetadata } from "./Pagination";

export const productUnitSchema = z.object({
    productId: z
        .string()
        .min(1, "Product reference is required"),

    unitId: z
        .string()
        .min(1, "Unit reference is required"),

    multiplier: z.coerce
        .number()
        .min(0.0001, "Multiplier must be greater than 0")
        .default(1),

    isDefault: z
        .boolean()
        .default(false),

    isFractionable: z
        .boolean()
        .default(false),

    isActive: z
        .boolean()
        .default(true),
});

export type ProductUnitFormData = z.infer<typeof productUnitSchema>;

export interface ProductUnitData {
    _id: string;
    productId: string;
    unitId: string;
    multiplier: number;
    isDefault: boolean;
    isFractionable: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface GroupedProductUnit {
    _id: string;
    productName: string;
    conversions: Array<{
        _id: string;
        unitName: string;
        shortName: string;
        multiplier: number;
        isDefault: boolean;
        isFractionable: boolean;
        isActive: boolean;
    }>;
}

export interface ProductUnitAPIResponse<T = ProductUnitData | ProductUnitData[] | GroupedProductUnit[]> {
    status: string;
    message?: string;
    data: T;
    meta?: PaginationMetadata;
}