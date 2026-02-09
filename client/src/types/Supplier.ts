import { z } from "zod";

export const supplierSchema = z.object({
    name: z.string().min(1, "Supplier name cannot be empty").trim(),
    phone: z.string().min(1, "Supplier phone cannot be empty").trim(),
    address: z.string().min(1, "Supplier address cannot be empty").trim(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    notes: z.string().optional(),
    isActive: z.boolean().default(true)
});

export type SupplierType = z.infer<typeof supplierSchema>;

interface SupplierProduct {
    _id: string;
    name: string;
    basePrice: number;
    sellingPrice: number;
    stock: number;
}

export interface SupplierApiResponse {
    _id: string; 
    data: SupplierType;
    productData?: SupplierProduct[]; 
    createdAt?: string;
}