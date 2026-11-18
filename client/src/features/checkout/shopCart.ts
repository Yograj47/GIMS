import { useOutletContext } from "react-router-dom";
import type { ProductPhoto } from "@/types/product";
import { readStorage, writeStorage } from "@/lib/browserStorage";

export type ShopUnit = { id: string; name: string; multiplier: number; fractional: boolean };
export type ShopProduct = { id: string; name: string; price: number; available: number; units: ShopUnit[]; cover?: ProductPhoto; photos?: ProductPhoto[] };
export type CartLine = { product: ShopProduct; unit: ShopUnit; quantity: number };

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function validId(value: unknown): value is string {
    return typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
}

function validUnit(value: unknown): value is ShopUnit {
    return isRecord(value) && validId(value.id) && typeof value.name === "string" &&
        typeof value.multiplier === "number" && Number.isFinite(value.multiplier) && value.multiplier > 0 &&
        typeof value.fractional === "boolean";
}

function validCartLine(value: unknown): value is CartLine {
    if (!isRecord(value) || !isRecord(value.product) || !validUnit(value.unit)) return false;
    const { product, unit, quantity } = value;
    if (!validId(product.id) || typeof product.name !== "string" ||
        typeof product.price !== "number" || !Number.isFinite(product.price) || product.price < 0 ||
        typeof product.available !== "number" || !Number.isFinite(product.available) || product.available < 0) return false;
    if (!Array.isArray(product.units) || product.units.length > 100 || !product.units.every(validUnit)) return false;
    return typeof quantity === "number" && Number.isFinite(quantity) && quantity >= 0.001 && quantity <= 10000 &&
        (unit.fractional || Number.isInteger(quantity)) &&
        product.units.some((entry) => entry.id === unit.id && entry.multiplier === unit.multiplier);
}

export const cartStorageKey = (accountId: string) => `gims-shop-cart:${accountId}`;

export function readCart(accountId?: string): CartLine[] {
    if (!accountId) return [];
    try {
        const stored: unknown = JSON.parse(readStorage("session", cartStorageKey(accountId)) ?? "[]");
        if (!Array.isArray(stored) || stored.length > 50 || !stored.every(validCartLine)) return [];
        const uniqueLines = new Set(stored.map((line) => line.product.id + ":" + line.unit.id));
        return uniqueLines.size === stored.length ? stored : [];
    } catch {
        return [];
    }
}

export function saveCart(accountId: string, cart: CartLine[]) {
    writeStorage("session", cartStorageKey(accountId), JSON.stringify(cart));
}

export function lineTotal(line: CartLine) {
    return Math.round(Math.round(line.product.price * line.unit.multiplier * 100) * line.quantity);
}

export function useShopCart() {
    return useOutletContext<{ cart: CartLine[]; setCart: React.Dispatch<React.SetStateAction<CartLine[]>> }>();
}
