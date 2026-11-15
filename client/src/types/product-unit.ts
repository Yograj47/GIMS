import { z } from "zod";

export const productUnitSchema = z.object({
    productId: z
        .string()
        .min(1, "Product reference is required"),

    unitId: z
        .string()
        .min(1, "Unit reference is required"),

    multiplier: z.coerce
        .number()
        .min(1, "Multiplier must be at least 1")
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
        unitId: string;
        unitName: string;
        shortForm: string;
        multiplier: number;
        isDefault: boolean;
        isFractionable: boolean;
        isActive: boolean;
    }>;
}
