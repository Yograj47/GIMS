import api from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { ProductData, ProductFormData } from "@/types/product";

const baseUrl = "/products";

function readImage(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

async function productRequest(payload: Partial<ProductFormData>) {
    if (payload.photos === undefined) return { body: payload };
    const photos = await Promise.all(payload.photos.map(async (photo) => "file" in photo
        ? { image: await readImage(photo.file), altText: photo.altText } : photo));
    return {
        body: { ...payload, photos },
        config: { headers: { "Content-Type": "application/vnd.grocerypro.product+json" } },
    };
}

export const productService = {
    getAll: async (page?: number, limit?: number, search?: string, category?: string, stockLevel?: string, all?: boolean, sort?: string, signal?: AbortSignal) => {
        const { data } = await api.get<ApiResponse<ProductData[]>>(baseUrl, {
            signal,
            params: all
                ? { paginate: false, search, category, stockLevel }
                : { page, limit, search, category, stockLevel, sort }
        });
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<ApiResponse>(`${baseUrl}/${id}`);
        return data;
    },

    create: async (payload: ProductFormData) => {
        const { body, config } = await productRequest(payload);
        const { data } = await api.post<ApiResponse>(baseUrl, JSON.stringify(body), config);
        return data;
    },

    updateById: async (id: string, payload: Partial<ProductFormData>) => {
        const { body, config } = await productRequest(payload);
        const { data } = await api.put<ApiResponse>(`${baseUrl}/${id}`, JSON.stringify(body), config);
        return data;
    },

    delete: async (id: string) => {
        const { data } = await api.delete(`${baseUrl}/${id}`);
        return data;
    }
};
