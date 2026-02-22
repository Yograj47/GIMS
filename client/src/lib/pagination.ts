import type { PaginationMetadata } from "@/types/Unit";

export interface PaginatedResponse<T> {
    items: T[];
    meta: PaginationMetadata;
}

export const generatePaginationRange = (currentPage: number, totalPages: number) => {
    let range: (number | string)[] = [];
    if (totalPages <= 7) {
        range = Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - 1, 1);
    const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // Case 1: No left dots, but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
        let leftItemCount = 3 + 2;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        range = [...leftRange, '...', totalPages];
    }

    // Case 2: No right dots, but left dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
        let rightItemCount = 3 + 2;
        let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
        range = [1, '...', ...rightRange];
    }

    // Case 3: Both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
        let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
        range = [1, '...', ...middleRange, '...', totalPages];
    }

    return range;
}