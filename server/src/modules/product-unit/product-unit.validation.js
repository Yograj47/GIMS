import { z } from "zod";

export const createProductUnitSchema =
    z.object({
        productId: z.string(),

        unitId: z.string(),

        multiplier: z.coerce
            .number()
            .min(1),

        isDefault: z.boolean().optional(),

        isFractionable:
            z.boolean().optional(),

        isActive:
            z.boolean().optional(),
    });

export const updateProductUnitSchema =
    createProductUnitSchema.partial();