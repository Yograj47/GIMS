import { z } from "zod"
import type { PaginationMetadata } from "./Unit";

export const categorySchema = z.object({
    name: z.string().min(2, "Category name must be at least 2 characters"),
    description: z.string().max(200, "Description cannot exceed 200 characters").optional().or(z.literal("")),
    isActive: z.boolean().optional()
})

export type CategoryFormData = z.infer<typeof categorySchema>

export interface CategoryData {
    _id: string;
    name: string;
    description: string;
    isActive: boolean;
    updatedAt: string;
    createdAt: string;
}

export interface CategoryAPIResponse {
    status: string;
    message?: string;
    data: CategoryData | CategoryData[];
    meta: PaginationMetadata
}