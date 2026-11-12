export interface SalesInvoice {
    _id: string;
    number: string;
    currency: string;
    createdAt: string;
    totalMinor: number;
    paidMinor: number;
    costMinor?: number;
    items: { productName?: string; quantity: number; totalMinor: number }[];
}

export function parseMinorAmount(value: string) {
    if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return null;
    const [whole, fraction = ""] = value.split(".");
    const amount = Number(whole + fraction.padEnd(2, "0"));
    return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

export function formatInvoiceMoney(amount: number, currency: string) {
    return new Intl.NumberFormat("en-NP", { style: "currency", currency }).format(amount / 100);
}
