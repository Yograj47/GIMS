import { z } from "zod";

export const generalSettingsSchema = z.object({
    storeName: z.string().min(2, "Store name must be at least 2 characters").trim(),
    location: z.string().min(1, "Location is required").trim(),
    adminEmail: z.string().email("Invalid email address").or(z.literal("")),
    lowStockThreshold: z.number().min(0, "Threshold cannot be negative"),
    enableEmailNotifications: z.boolean().default(true),
    currency: z.string().min(1, "Currency is required").default("NPR"),
    taxRate: z.number().min(0, "Tax rate cannot be negative").default(0),
});

export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

export interface GeneralSettingsData extends GeneralSettingsFormData {
    _id: string;
    createdAt: string;
    updatedAt: string;
}

export interface GeneralSettingsAPIResponse {
    status: string;
    message?: string;
    data: GeneralSettingsData;
}