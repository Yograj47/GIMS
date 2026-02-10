import { z } from "zod"

export const unitSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    shortForm: z.string().min(1, "Short form is required").max(10),
    unitType: z.string(),
    baseUnit: z.boolean().optional(),
    isFractional: z.boolean().optional(),
    isActive: z.boolean().optional(),
})

export type UnitFormData = z.infer<typeof unitSchema>

export interface UnitData {
    _id: string;
    name: string;
    shortForm: string;
    unitType: string;
    baseUnit: boolean;
    isFractional: boolean;
    isActive: boolean;
}

export interface UnitAPIResponse {
    status: string;
    message?: string;
    data: UnitData | UnitData[];
}