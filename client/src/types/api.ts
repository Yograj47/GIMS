import type { PaginationMetadata } from "./pagination";
import type { SupplierProduct } from "./supplier";

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    productData?: SupplierProduct[];
    meta?: PaginationMetadata;
}
