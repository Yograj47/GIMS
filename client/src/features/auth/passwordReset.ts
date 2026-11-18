import { readStorage, writeStorage } from "@/lib/browserStorage";

const resetKey = (customer: boolean) => `password-reset:${customer ? "customer" : "workspace"}`;

export function readPasswordReset(customer: boolean) {
    try {
        const saved: unknown = JSON.parse(readStorage("session", resetKey(customer)) ?? "null");
        if (!saved || typeof saved !== "object" || !("email" in saved) || !("expiresAt" in saved) ||
            typeof saved.email !== "string" || typeof saved.expiresAt !== "number") return null;
        const remaining = Math.floor((saved.expiresAt - Date.now()) / 1000);
        return remaining > 0 && remaining <= 600 ? { email: saved.email, remaining } : null;
    } catch { return null; }
}

export function savePasswordReset(customer: boolean, email: string) {
    writeStorage("session", resetKey(customer), JSON.stringify({ email, expiresAt: Date.now() + 600_000 }));
}

export function clearPasswordReset(customer: boolean) {
    writeStorage("session", resetKey(customer), null);
}
