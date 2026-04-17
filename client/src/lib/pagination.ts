import type { PaginationMetadata } from "@/types/Pagination";

export interface PaginatedResponse<T> {
    items: T[];
    meta: PaginationMetadata;
}

export const generatePaginationRange = (current: number, total: number) => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const siblings = 1;
    const leftSiblingIndex = Math.max(current - siblings, 1);
    const rightSiblingIndex = Math.min(current + siblings, total);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < total - 2;

    if (!showLeftDots && showRightDots) {
        let leftItemCount = 3 + 2 * siblings;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        return [...leftRange, "...", total];
    }

    if (showLeftDots && !showRightDots) {
        let rightItemCount = 3 + 2 * siblings;
        let rightRange = Array.from({ length: rightItemCount }, (_, i) => total - rightItemCount + i + 1);
        return [1, "...", ...rightRange];
    }

    if (showLeftDots && showRightDots) {
        let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
        return [1, "...", ...middleRange, "...", total];
    }
};