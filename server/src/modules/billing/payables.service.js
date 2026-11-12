import mongoose from "mongoose";
import { AppError } from "../../shared/errors/index.js";
import { GoodsReceipt, SupplierReturn } from "../receiving/receiving.model.js";
import { JournalEntry, SupplierBill, SupplierCredit, SupplierPayment } from "./billing.model.js";
import { postJournal, safeMoney, scaledInteger } from "./billing.service.js";

const scale = 1_000_000n;
const round = (numerator, denominator) => (numerator + denominator / 2n) / denominator;

export function receiptLineMinor(line, quantityInBaseUnits) {
    const rate = scaledInteger(line.unitCost, 6);
    if (quantityInBaseUnits === undefined) {
        return round(rate * scaledInteger(line.enteredQuantity, 6) * 100n, scale * scale);
    }
    return round(rate * scaledInteger(quantityInBaseUnits, 6) * 100n, scaledInteger(line.multiplier, 6) * scale);
}

function balanceDue(bill) {
    return bill.totalMinor - bill.creditedMinor - bill.paidMinor;
}

export async function createSupplierBill(input, userId) {
    await Promise.all([SupplierBill.init(), JournalEntry.init()]);
    return mongoose.connection.transaction(async (session) => {
        const existing = await SupplierBill.findOne({ receiptId: input.receiptId }).session(session);
        if (existing) {
            if (existing.number !== input.number) throw AppError.conflict("A bill already exists for this receipt");
            return { document: existing, created: false };
        }
        const receipt = await GoodsReceipt.findById(input.receiptId).session(session);
        if (!receipt) throw AppError.notFound("Goods receipt not found");
        if (receipt.currency !== "NPR") throw AppError.badRequest("Supplier billing currently supports NPR receipts");
        const totalMinor = safeMoney(receipt.items.reduce((sum, line) => sum + receiptLineMinor(line), 0n));
        if (!totalMinor) throw AppError.badRequest("The goods receipt must have a positive total");
        const [document] = await SupplierBill.create([{
            receiptId: receipt.id,
            supplierId: receipt.supplierId,
            recordedBy: userId,
            currency: receipt.currency,
            number: input.number,
            totalMinor,
        }], { session });
        await postJournal(document, "supplier_bill", document.id, userId, "inventory", "accounts_payable", totalMinor, session, "supplierBillId");
        return { document, created: true };
    });
}

export async function createSupplierCredit(billId, input, userId) {
    await Promise.all([SupplierCredit.init(), JournalEntry.init()]);
    return mongoose.connection.transaction(async (session) => {
        const existing = await SupplierCredit.findOne({ returnId: input.returnId }).session(session);
        if (existing) {
            if (existing.billId.toString() !== billId.toLowerCase() || existing.reference !== input.reference) {
                throw AppError.conflict("This return already has a different supplier credit");
            }
            return { document: existing, created: false };
        }
        const bill = await SupplierBill.findById(billId).session(session);
        if (!bill) throw AppError.notFound("Supplier bill not found");
        const returned = await SupplierReturn.findOne({ _id: input.returnId, receiptId: bill.receiptId }).session(session);
        if (!returned) throw AppError.notFound("Return for this receipt not found");
        const receipt = await GoodsReceipt.findById(bill.receiptId).session(session);
        const line = receipt?.items.id(returned.receiptLineId);
        if (!line) throw AppError.conflict("The original receipt line is missing");
        const amountMinor = safeMoney(receiptLineMinor(line, returned.baseQuantity));
        if (!amountMinor || amountMinor > balanceDue(bill)) {
            throw AppError.conflict("The credit must be positive and within the outstanding balance");
        }
        bill.creditedMinor += amountMinor;
        await bill.save({ session });
        const [document] = await SupplierCredit.create([{
            billId,
            returnId: returned.id,
            recordedBy: userId,
            amountMinor,
            reference: input.reference,
        }], { session });
        await postJournal(bill, "supplier_credit", document.id, userId, "accounts_payable", "inventory", amountMinor, session, "supplierBillId");
        return { document, created: true };
    });
}

export async function recordSupplierPayment(billId, input, userId) {
    await Promise.all([SupplierPayment.init(), JournalEntry.init()]);
    return mongoose.connection.transaction(async (session) => {
        const existing = await SupplierPayment.findOne({ requestKey: input.requestKey }).session(session);
        if (existing) {
            if (existing.billId.toString() !== billId.toLowerCase() || existing.amountMinor !== input.amountMinor ||
                existing.method !== input.method || existing.reference !== input.reference) {
                throw AppError.conflict("This request key was used for a different supplier payment");
            }
            return { document: existing, created: false };
        }
        const bill = await SupplierBill.findById(billId).session(session);
        if (!bill) throw AppError.notFound("Supplier bill not found");
        if (input.amountMinor > balanceDue(bill)) throw AppError.conflict("Payment exceeds the outstanding bill balance");
        bill.paidMinor += input.amountMinor;
        await bill.save({ session });
        const [document] = await SupplierPayment.create([{
            ...input,
            billId,
            recordedBy: userId,
        }], { session });
        const credit = input.method === "cash" ? "cash_on_hand" : "bank";
        await postJournal(bill, "supplier_payment", document.id, userId, "accounts_payable", credit, input.amountMinor, session, "supplierBillId");
        return { document, created: true };
    });
}
