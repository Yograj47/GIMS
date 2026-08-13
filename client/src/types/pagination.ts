export interface pagination {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    startDate?: string;
    transactionType?: string;
    endDate?: string;
    stockLevel?: string;
    all?: boolean;
}

export interface PaginationMetadata {
    totalItems: number;
    itemsPerPage: number;
    currentPage?: number;
    totalPages?: number;
    paginationDisabled?: boolean;
}