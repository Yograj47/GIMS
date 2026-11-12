import mongoose from "mongoose";
import { AppError } from "../../shared/errors/index.js";
import { createMovement } from "../movement/movement.repository.js";
import Product from "../product/product.model.js";
import ProductUnit from "../product-unit/product-unit.model.js";
import Supplier from "../supplier/supplier.model.js";
import { GoodsReceipt, StockLot, SupplierReturn } from "./receiving.model.js";

export async function resolveStockUnit(productId, unitId, quantity, session) {
    const unit = await ProductUnit.findOne({ productId, unitId, isActive: true }).session(session);
    if (!unit) throw AppError.badRequest("The selected unit is not configured for this product");
    if (!unit.isFractionable && !Number.isInteger(quantity)) {
        throw AppError.badRequest("This product unit requires a whole quantity");
    }
    return unit;
}

export async function receiveGoods(payload, userId) {
    await GoodsReceipt.init();
    await StockLot.init();
    return mongoose.connection.transaction(async (session) => {
        const supplier = await Supplier.findOne({ _id: payload.supplierId, isActive: true }).session(session);
        if (!supplier) throw AppError.notFound("Active supplier not found");

        const receipt = new GoodsReceipt({
            requestKey: payload.requestKey,
            supplierId: supplier.id,
            supplierName: supplier.name,
            performedBy: userId,
            deliveryReference: payload.deliveryReference,
            currency: payload.currency,
            items: [],
        });

        for (const item of payload.items) {
            const product = await Product.findOne({ _id: item.productId, isActive: true }).session(session);
            if (!product) throw AppError.notFound("Active product not found");

            const unit = await resolveStockUnit(product.id, item.unitId, item.quantity, session);

            const baseQuantity = item.quantity * unit.multiplier;
            if (!Number.isFinite(baseQuantity) || item.quarantinedQuantity > baseQuantity) {
                throw AppError.badRequest("Invalid received or quarantined quantity");
            }
            const sellableQuantity = baseQuantity - item.quarantinedQuantity;
            const line = receipt.items.create({
                productId: product.id,
                unitId: item.unitId,
                multiplier: unit.multiplier,
                enteredQuantity: item.quantity,
                baseQuantity,
                quarantinedQuantity: item.quarantinedQuantity,
                unitCost: item.unitCost,
            });
            receipt.items.push(line);

            const lot = new StockLot({
                productId: product.id,
                supplierId: supplier.id,
                receiptId: receipt.id,
                receiptLineId: line.id,
                baseUnitId: product.unitId,
                batchNumber: item.batchNumber,
                expiresOn: item.expiresOn,
                sellableQuantity,
                quarantinedQuantity: item.quarantinedQuantity,
            });
            await lot.save({ session });

            const oldQuantity = product.quantity;
            product.quantity += sellableQuantity;
            product.hasStockLots = true;
            product.stockRevision += 1;
            await product.save({ session });
            await createMovement({
                productId: product.id,
                performedBy: userId,
                unitId: item.unitId,
                multiplier: unit.multiplier,
                quantity: baseQuantity,
                movementType: "IN",
                reason: "Supplier receipt",
                oldQuantity,
                newQuantity: product.quantity,
                receiptId: receipt.id,
                lotId: lot.id,
                quarantinedQuantity: item.quarantinedQuantity,
            }, session);
        }
        return receipt.save({ session });
    });
}

export async function returnGoods(payload, userId) {
    await SupplierReturn.init();
    return mongoose.connection.transaction(async (session) => {
        const lot = await StockLot.findById(payload.lotId).session(session);
        if (!lot) throw AppError.notFound("Stock lot not found");

        const bucket = payload.bucket === "sellable" ? "sellableQuantity" : "quarantinedQuantity";
        if (lot[bucket] < payload.quantity) throw AppError.conflict("Insufficient quantity in this lot");

        const product = await Product.findById(lot.productId).session(session);
        if (!product) throw AppError.conflict("The product for this lot is missing");

        const oldQuantity = product.quantity;
        if (payload.bucket === "sellable") {
            if (oldQuantity < payload.quantity) throw AppError.conflict("Insufficient sellable stock");
            product.quantity -= payload.quantity;
        }
        product.stockRevision += 1;
        await product.save({ session });

        lot[bucket] -= payload.quantity;
        await lot.save({ session });
        const supplierReturn = new SupplierReturn({
            requestKey: payload.requestKey,
            supplierId: lot.supplierId,
            lotId: lot.id,
            receiptId: lot.receiptId,
            receiptLineId: lot.receiptLineId,
            performedBy: userId,
            bucket: payload.bucket,
            baseQuantity: payload.quantity,
            reason: payload.reason,
        });
        await supplierReturn.save({ session });
        await createMovement({
            productId: lot.productId,
            performedBy: userId,
            unitId: lot.baseUnitId,
            multiplier: 1,
            quantity: payload.quantity,
            movementType: "OUT",
            reason: "Supplier return",
            oldQuantity,
            newQuantity: product.quantity,
            receiptId: lot.receiptId,
            lotId: lot.id,
            supplierReturnId: supplierReturn.id,
            quarantinedQuantity: payload.bucket === "quarantined" ? payload.quantity : 0,
        }, session);
        return supplierReturn;
    });
}

export async function consumeReceivedStock(productId, quantity, session) {
    const lots = await StockLot.find({ productId, sellableQuantity: { $gt: 0 } })
        .sort({ createdAt: 1, _id: 1 }).session(session);
    const allocations = [];
    let remaining = quantity;
    for (const lot of lots) {
        if (remaining <= 0) break;
        const taken = Math.min(remaining, lot.sellableQuantity);
        lot.sellableQuantity -= taken;
        remaining -= taken;
        await lot.save({ session });
        allocations.push({ lotId: lot.id, quantity: taken });
    }
    return allocations;
}
