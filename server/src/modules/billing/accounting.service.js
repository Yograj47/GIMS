import mongoose from "mongoose";
import { AppError } from "../../shared/errors/index.js";
import Movement from "../movement/movement.model.js";
import { GoodsReceipt, StockLot } from "../receiving/receiving.model.js";
import { JournalEntry, SalesInvoice, SupplierBill } from "./billing.model.js";
import { postJournal, safeMoney } from "./billing.service.js";
import { receiptLineMinor } from "./payables.service.js";

export async function postSaleCost(invoiceId, userId) {
    await JournalEntry.init();
    return mongoose.connection.transaction(async (session) => {
        const invoice = await SalesInvoice.findById(invoiceId).session(session);
        if (!invoice) throw AppError.notFound("Invoice not found");
        const existing = await JournalEntry.findOne({ sourceType: "sale_cost", sourceId: invoice.id }).session(session);
        if (existing || invoice.costMinor !== undefined) return invoice;

        const movements = await Movement.find({ transactionId: invoice.transactionId, movementType: "OUT" }).session(session);
        if (movements.length !== invoice.items.length) {
            throw AppError.conflict("Inventory cost could not be posted because the invoice and its stock movements do not match.");
        }
        const untracked = movements.filter((movement) => {
            const allocated = (movement.lotAllocations ?? []).reduce((total, entry) => total + entry.quantity, 0);
            return Math.abs(allocated - movement.quantity) > 1e-8;
        });
        if (untracked.length) {
            const productIds = new Set(untracked.map((movement) => movement.productId.toString()));
            const names = [...new Set(invoice.items.filter((item) => productIds.has(item.productId.toString()))
                .map((item) => item.productName))];
            const products = names.length ? ` Affected products: ${names.join(", ")}.` : "";
            throw AppError.conflict(`Inventory cost could not be posted because some sold stock has no supplier receipt lot recorded.${products}`);
        }
        const quantitiesByLot = new Map();
        for (const movement of movements) {
            for (const allocation of movement.lotAllocations) {
                const id = allocation.lotId.toString();
                quantitiesByLot.set(id, (quantitiesByLot.get(id) ?? 0) + allocation.quantity);
            }
        }
        const lots = await StockLot.find({ _id: { $in: [...quantitiesByLot.keys()] } }).session(session);
        if (lots.length !== quantitiesByLot.size) throw AppError.conflict("One or more source lots are missing");
        const receiptIds = lots.map((lot) => lot.receiptId);
        const bills = await SupplierBill.find({ receiptId: { $in: receiptIds }, currency: invoice.currency }).session(session);
        const billed = new Set(bills.map((bill) => bill.receiptId.toString()));
        if (lots.some((lot) => !billed.has(lot.receiptId.toString()))) {
            throw AppError.conflict("Post the supplier bills for all source lots before posting the sale cost");
        }
        const receipts = await GoodsReceipt.find({ _id: { $in: receiptIds } }).session(session);
        const receiptsById = new Map(receipts.map((receipt) => [receipt.id, receipt]));
        let cost = 0n;
        for (const lot of lots) {
            const line = receiptsById.get(lot.receiptId.toString())?.items.id(lot.receiptLineId);
            if (!line) throw AppError.conflict("A source receipt line is missing");
            cost += receiptLineMinor(line, Number(quantitiesByLot.get(lot.id).toFixed(6)));
        }
        invoice.costMinor = safeMoney(cost);
        await invoice.save({ session });
        if (invoice.costMinor > 0) {
            await postJournal(invoice, "sale_cost", invoice.id, userId, "cost_of_goods_sold", "inventory", invoice.costMinor, session);
        }
        return invoice;
    });
}

export async function accountingSummary() {
    return mongoose.connection.transaction(async (session) => {
        const accounts = await JournalEntry.aggregate([
            { $unwind: "$lines" },
            { $group: {
                _id: "$lines.account",
                debits: { $sum: { $cond: [{ $eq: ["$lines.side", "debit"] }, { $toDecimal: "$lines.amountMinor" }, 0] } },
                credits: { $sum: { $cond: [{ $eq: ["$lines.side", "credit"] }, { $toDecimal: "$lines.amountMinor" }, 0] } },
            } },
            { $sort: { _id: 1 } },
            { $project: {
                _id: 0, account: "$_id",
                debitMinor: { $toString: "$debits" },
                creditMinor: { $toString: "$credits" },
            } },
        ]).session(session);
        const invoicesWithoutCost = await SalesInvoice.countDocuments({ costMinor: { $exists: false } }).session(session);
        return { currency: "NPR", accounts, invoicesWithoutCost };
    }, { readConcern: { level: "snapshot" } });
}
