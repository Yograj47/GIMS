import { z } from "zod";

export const createCategorySchema = z.object({
    name: z
        .string()
        .min(
            2,
            "Category name must be at least 2 characters"
        )
        .max(
            50,
            "Category name cannot exceed 50 characters"
        )
        .trim(),

    description: z
        .string()
        .max(
            200,
            "Description cannot exceed 200 characters"
        )
        .optional()
        .default(""),

    isActive: z
        .boolean()
        .optional(),
});

export const updateCategorySchema =
    createCategorySchema.partial();