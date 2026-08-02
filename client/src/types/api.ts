export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    meta?: {
        totalItems?: number;
        itemsPerPage?: number;
        currentPage?: number;
        totalPages?: number;
        paginationDisabled?: boolean;
    };
}