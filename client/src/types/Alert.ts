export type AlertType = "low-stock" | "out-of-stock" | "price-change" | "threshold-reached";
export type AlertSeverity = "info" | "warning" | "critical";

export interface AlertData {
    _id: string;
    productId: {
        _id: string;
        name: string;
        quantity: number;
        threshold: number;
        unit?: {
            name: string;
        };
    };
    type: AlertType;
    severity: AlertSeverity;
    message: string;
    snapshotValue: number;
    resolved: boolean;
    resolvedAt?: string | Date;
    createdAt: string;
    updatedAt: string;
}

export interface PaginationMetadata {
    totalItems: number;
    itemsPerPage: number;
    currentPage?: number;
    totalPages?: number;
    paginationDisabled?: boolean;
}

export interface AlertAPIResponse {
    status: string;
    data: AlertData[];
    meta?: PaginationMetadata; 
    message?: string;
}