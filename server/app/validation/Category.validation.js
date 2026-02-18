import { z } from "zod";

export const categorySchema = z.object({
    name: z
        .string()
        .min(2, "Category name must be at least 2 characters")
        .max(50, "Category name is too long")
        .trim(),
    description: z
        .string()
        .max(200, "Description cannot exceed 200 characters")
        .optional()
        .or(z.literal("")), 
    isActive: z.boolean().optional()
});