import Transaction from "../transaction/transaction.model.js";
import CheckoutOrder from "../checkout/checkout.model.js";
import Product from "../product/product.model.js";
import { GoodsReceipt } from "../receiving/receiving.model.js";
import { receiptLineMinor } from "../billing/payables.service.js";

const zone = "Asia/Kathmandu";
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" });

export async function storeOverview(includeOperations) {
    const now = new Date();
    const today = new Date(dayKey.format(now) + "T00:00:00+05:45");
    const dayMs = 86_400_000;
    const start = new Date(today.getTime() - 6 * dayMs);
    const dates = { $gte: start, $lte: now };
    const [sales, receipts, lowStock, onlineOrders] = await Promise.all([
        Transaction.aggregate([
            { $match: { transactionType: "Sale", createdAt: dates } },
            { $group: { _id: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d", timezone: zone } }, amount: { $sum: "$grandTotal" } } },
        ]),
        GoodsReceipt.find({ currency: "NPR", createdAt: dates }).select("createdAt items.enteredQuantity items.unitCost").lean(),
        Product.countDocuments({ isActive: true, $expr: { $lte: ["$quantity", "$threshold"] } }),
        includeOperations ? CheckoutOrder.countDocuments({
            channel: "online",
            $or: [{ status: { $in: ["paid", "payment_review"] } }, { status: "reserved", expiresAt: { $gt: now } }],
        }) : null,
    ]);
    const dailySales = new Map(sales.map(({ _id, amount }) => [_id, amount]));
    const dailyPurchases = new Map();
    for (const receipt of receipts) {
        const date = dayKey.format(receipt.createdAt);
        const total = receipt.items.reduce((sum, line) => sum + receiptLineMinor(line), 0n);
        dailyPurchases.set(date, (dailyPurchases.get(date) ?? 0n) + total);
    }
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = dayKey.format(new Date(start.getTime() + i * dayMs));
        return { date, sales: dailySales.get(date) ?? 0, purchases: Number(dailyPurchases.get(date) ?? 0n) / 100 };
    });
    return { days, lowStock, onlineOrders };
}
