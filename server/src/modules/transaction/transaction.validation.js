import { z } from "zod";

const objectId =
    /^[0-9a-fA-F]{24}$/;

export const transactionItemSchema =
    z.object({
        productId: z
            .string()
            .regex(
                objectId,
                "Invalid Product ID"
            ),

        unitId: z
            .string()
            .regex(
                objectId,
                "Invalid Unit ID"
            ),

        unitName: z
            .string()
            .optional(),

        multiplier: z
            .number()
            .min(1),

        qty: z
            .number()
            .min(0.001),

        rate: z
            .number()
            .min(0),

        total: z
            .number()
            .min(0),
    });

export const createTransactionSchema =
    z.object({
        transactionType: z.enum([
            "Purchase",
            "Sale",
            "Return",
            "Damage",
            "Adjustment",
        ]),

        items: z
            .array(transactionItemSchema)
            .min(
                1,
                "At least one item is required"
            ),

        grandTotal: z
            .number()
            .min(0),

        isPaid: z
            .boolean()
            .optional(),

        partyDetails: z
            .object({
                name: z
                    .string()
                    .optional(),

                phone: z
                    .string()
                    .optional(),
            })
            .optional(),

        notes: z
            .string()
            .optional(),
    });

export const updateTransactionSchema =
    createTransactionSchema.partial();