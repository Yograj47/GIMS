import { z } from "zod";

export const supplierSchema = z.object({
    name: z.string().min(1, "Supplier name cannot be empty").trim(),
    phone: z.string().min(1, "Supplier phone cannot be empty").trim(),
    address: z.string().min(1, "Supplier address cannot be empty").trim(),
    notes: z.string().optional(),
    isActive: z.boolean().optional()
});

export type SupplierType = z.infer<typeof supplierSchema>;

interface SupplierProduct {
    name: string;
    basePrice: number;
    sellingPrice: number;
}

export interface SupplierApiResponse {
    status: string;
    data: SupplierType & {
        _id: string;
        productData: SupplierProduct[]; 
    };
}