import { z } from "zod";

export const supplierSchema = z.object({
    name: z.string().min(1, "Supplier name cannot be empty").trim(),
    phone: z.string().min(10, "Phone number must be between 10 and 15 digits").regex(/^\d{10,15}$/, "Invalid phone number format eg: 9834567890").trim(),
    address: z.string().min(1, "Supplier address cannot be empty eg: Kavi marga, Banasthali, Kathmandu").trim(),
    email: z.email("Invalid email address").optional().or(z.literal("")),
    notes: z.string().optional(),
    isActive: z.boolean().default(true)
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

export type SupplierData = { _id: string } & SupplierFormData;

export interface SupplierProduct {
    _id: string;
    name: string;
    basePrice: number;
    sellingPrice: number;
    stock: number;
}
