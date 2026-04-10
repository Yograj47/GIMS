import type { PaginationMetadata } from "./Pagination";

export type AlertType = "low-stock" | "out-of-stock" | "price-change" | "threshold-reached";
export type AlertSeverity = "info" | "warning" | "critical";

export interface AlertData {
    _id: string;
    productId: {
        _id: string;
        name: string;
        quantity: number;
        threshold: number;
        unitId?: { name: string };
    };
    type: AlertType;
    severity: AlertSeverity;
    message: string;
    snapshotValue: number;
    acknowledged: boolean;          
    acknowledgedAt?: string | Date; 
    acknowledgedBy?: string;        
    resolved: boolean;
    resolvedAt?: string | Date;
    createdAt: string;
    updatedAt: string;
}

export interface AlertAPIResponse {
    status: string;
    data: AlertData[];
    meta?: PaginationMetadata; 
    message?: string;
}