import { z } from "zod";

export const createMovementSchema =
    z.object({
        productId: z
            .string()
            .regex(
                /^[0-9a-fA-F]{24}$/,
                "Invalid Product ID format"
            ),

        transactionId: z
            .string()
            .regex(
                /^[0-9a-fA-F]{24}$/,
                "Invalid Transaction ID format"
            )
            .optional(),

        performedBy: z
            .string()
            .regex(
                /^[0-9a-fA-F]{24}$/,
                "Invalid User ID format"
            ),

        unitId: z
            .string()
            .regex(
                /^[0-9a-fA-F]{24}$/,
                "Invalid Unit ID format"
            ),

        multiplier: z
            .number()
            .min(0.001)
            .default(1),

        quantity: z
            .number()
            .min(
                0.001,
                "Quantity must be greater than zero"
            ),

        movementType: z.enum([
            "IN",
            "OUT",
        ]),

        reason: z.string().optional(),

        oldQuantity: z.number(),

        newQuantity: z.number(),
    });

export const updateMovementSchema =
    createMovementSchema.partial();