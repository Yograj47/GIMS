import { z } from "zod";

const unitFields = {
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .trim(),

    shortForm: z
        .string()
        .min(1, "Short form is required")
        .max(10)
        .trim(),

    unitType: z.enum([
        "weight",
        "volume",
        "count",
        "pack",
    ]),

    multiplierToBase: z.coerce
        .number()
        .min(1, "Multiplier must be at least 1")
        .default(1),

    baseUnit: z.boolean().optional(),

    isFractional: z.boolean().optional(),

    isActive: z.boolean().optional(),
};

export const createUnitSchema =
    z.object(unitFields);

export const updateUnitSchema =
    createUnitSchema.partial();