import { useOutletContext } from "react-router-dom";
import type { ProductPhoto } from "@/types/product";

export type ShopUnit = { id: string; name: string; multiplier: number; fractional: boolean };
export type ShopProduct = { id: string; name: string; price: number; available: number; units: ShopUnit[]; cover?: ProductPhoto; photos?: ProductPhoto[] };
export type CartLine = { product: ShopProduct; unit: ShopUnit; quantity: number };

export const cartKey = "gims-shop-cart";
export function readCart(): CartLine[] {
    try {
        const stored: unknown = JSON.parse(sessionStorage.getItem(cartKey) ?? "[]");
        return Array.isArray(stored) ? stored : [];
    } catch {
        return [];
    }
}

export function lineTotal(line: CartLine) {
    return Math.round(Math.round(line.product.price * line.unit.multiplier * 100) * line.quantity);
}

export function useShopCart() {
    return useOutletContext<{ cart: CartLine[]; setCart: React.Dispatch<React.SetStateAction<CartLine[]>> }>();
}
