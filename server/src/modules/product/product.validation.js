import z from "zod";

const productBaseSchema = z.object({
    name: z.string().min(1).trim(),

    categoryId: z
        .string()
        .regex(
            /^[0-9a-fA-F]{24}$/,
            "Invalid Category ID format"
        ),

    unitId: z
        .string()
        .regex(
            /^[0-9a-fA-F]{24}$/,
            "Invalid Unit ID format"
        ),

    supplierId: z
        .string()
        .regex(
            /^[0-9a-fA-F]{24}$/,
            "Invalid Supplier ID format"
        )
        .optional()
        .or(
            z.literal("").transform(
                () => undefined
            )
        ),

    quantity: z.number().min(0),

    threshold: z.number().min(0),

    basePrice: z.number().min(0.01),

    sellingPrice: z.number().min(0.01),

    isActive: z.boolean(),
});

export const createProductSchema =
    productBaseSchema.extend({
        quantity: productBaseSchema.shape.quantity.default(0),
        threshold: productBaseSchema.shape.threshold.default(0),
        isActive: productBaseSchema.shape.isActive.default(true),
    }).refine(
        data =>
            data.sellingPrice >=
            data.basePrice,
        {
            message:
                "Selling price must be greater than or equal to the base price",
            path: ["sellingPrice"],
        }
    );

export const updateProductSchema =
    productBaseSchema
        .partial()
        .refine(
            data =>
                data.basePrice === undefined ||
                data.sellingPrice === undefined ||
                data.sellingPrice >=
                data.basePrice,
            {
                message:
                    "Selling price must be greater than or equal to the base price",
                path: ["sellingPrice"],
            }
        );
