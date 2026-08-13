import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { GroupedProductUnit, ProductUnitData, ProductUnitFormData } from "@/types/product-unit";
const BASE_URL = "/product-units";

export const productUnitService = {
    getGroupedUnits: async (page: number = 1, limit: number = 10, search?: string, all?: boolean) => {
        const { data } = await api.get<ApiResponse<GroupedProductUnit[]>>(
            `${BASE_URL}/`, {
            params: all
                ? { paginate: false, search }
                : { page, limit, search }
        }
        );
        return data;
    },

    create: async (payload: ProductUnitFormData) => {
        const { data } = await api.post<ApiResponse<ProductUnitData>>(
            `${BASE_URL}/`,
            payload
        );
        return data;
    },

    update: async (id: string, payload: Partial<ProductUnitFormData>) => {
        const { data } = await api.put<ApiResponse<ProductUnitData>>(
            `${BASE_URL}/${id}`,
            payload
        );
        return data;
    },

    delete: async (id: string) => {
        const { data } = await api.delete<ApiResponse<null>>(
            `${BASE_URL}/${id}`
        );
        return data;
    }
};

