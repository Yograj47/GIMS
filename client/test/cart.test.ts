import { beforeEach, describe, expect, it, vi } from "vitest";
import { cartStorageKey, lineTotal, readCart, saveCart, type CartLine } from "../src/features/checkout/shopCart";

const unit = { id: "000000000000000000000001", name: "Kilogram", multiplier: 1, fractional: true };
const line: CartLine = {
    product: { id: "000000000000000000000002", name: "Rice", price: 195, available: 20, units: [unit] },
    unit,
    quantity: 1.5,
};

beforeEach(() => { sessionStorage.clear(); vi.restoreAllMocks(); });

describe("saved cart", () => {
    it("isolates each account and keeps signed-out carts empty", () => {
        saveCart("customer-a", [line]);
        expect(readCart("customer-a")).toEqual([line]);
        expect(readCart("customer-b")).toEqual([]);
        expect(readCart()).toEqual([]);
        sessionStorage.setItem("gims-shop-cart", JSON.stringify([line]));
        expect(readCart("customer-b")).toEqual([]);
    });
    it.each([
        "[{}]",
        "invalid json",
        JSON.stringify([{ ...line, quantity: -1 }]),
        JSON.stringify([{ ...line, quantity: 10001 }]),
        JSON.stringify([line, line]),
        JSON.stringify([{ ...line, unit: { ...unit, multiplier: 500 } }]),
    ])("rejects malformed cart data %s", (stored) => {
        sessionStorage.setItem(cartStorageKey("customer-a"), stored);
        expect(readCart("customer-a")).toEqual([]);
    });
    it("keeps the page usable when storage is blocked", () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Denied"); });
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Denied"); });
        expect(readCart("customer-a")).toEqual([]);
        expect(() => saveCart("customer-a", [line])).not.toThrow();
    });
    it("calculates fractional line amounts in minor currency units", () => {
        expect(lineTotal(line)).toBe(29250);
    });
});
