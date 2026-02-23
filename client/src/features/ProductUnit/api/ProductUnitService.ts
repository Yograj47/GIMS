import api from "@/lib/api";
import type { GroupedProductUnit, ProductUnitAPIResponse, ProductUnitData, ProductUnitFormData } from "@/types/ProductUnit";
const BASE_URL = "/product-units";

export const productUnitService = {
    /**
     * Gets all product units grouped by product.
     * Uses your MongoDB Aggregation controller logic.
     */
    getGroupedUnits: async (page: number = 1, limit: number = 10, search?: string, all?: boolean) => {
        const { data } = await api.get<ProductUnitAPIResponse<GroupedProductUnit[]>>(
            `${BASE_URL}/`, {
            params: all
                ? { paginate: false, search }
                : { page, limit, search }
        }
        );
        return data;
    },

    /**
     * Creates a new unit conversion for a product.
     */
    create: async (payload: ProductUnitFormData) => {
        const { data } = await api.post<ProductUnitAPIResponse<ProductUnitData>>(
            `${BASE_URL}/`,
            payload
        );
        return data;
    },

    /**
     * Updates an existing conversion (multiplier, default status, etc.)
     */
    update: async (id: string, payload: Partial<ProductUnitFormData>) => {
        const { data } = await api.put<ProductUnitAPIResponse<ProductUnitData>>(
            `${BASE_URL}/${id}`,
            payload
        );
        return data;
    },

    /**
     * Deletes a product-unit conversion.
     */
    delete: async (id: string) => {
        const { data } = await api.delete<ProductUnitAPIResponse<null>>(
            `${BASE_URL}/${id}`
        );
        return data;
    }
};

