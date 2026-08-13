import { z } from "zod";

export const unitSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  shortForm: z.string().min(1, "Short form is required").max(10).trim(),
  unitType: z.enum(['weight', 'volume', 'count', 'pack']).describe("Please select a valid unit type"),
  multiplierToBase: z.coerce
    .number()
    .min(1, "Multiplier must be at least 1")
    .default(1),

  baseUnit: z.boolean().optional().default(false),
  isFractional: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export type UnitFormData = z.infer<typeof unitSchema>;

export interface UnitData {
  _id: string;
  name: string;
  shortForm: string;
  unitType: 'weight' | 'volume' | 'count' | 'pack';
  multiplierToBase: number;
  baseUnit: boolean;
  isFractional: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

