import Transaction from "../models/Transaction.Model.js";
import StockMovement from "../models/StockMovement.Model.js";
import Product from "../models/Product.Model.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { transactionSchema } from "../validation/Transaction.validation.js";

// --- WRITES (The "Sync" Logic) ---
export const createUnifiedTransaction = asyncHandler(async (req, res) => {
    const validateResult = transactionSchema.parse(req.body);
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const transaction = await Transaction.create([validateResult], { session });

        for (const item of validateResult.items) {
            const product = await Product.findById(item.productId).session(session);
            if (!product) throw new Error(`Product ${item.productId} not found`);

            const isStockIN = ['Purchase', 'Return'].includes(validateResult.transactionType);
            const oldQty = product.stock;

            const newQty = isStockIN ? oldQty + item.qty : oldQty - item.qty;

            await StockMovement.create([{
                productId: item.productId,
                transactionId: transaction[0]._id,
                performedBy: req.user._id,
                quantity: item.qty,
                movementType: isStockIN ? 'IN' : 'OUT',
                oldQuantity: oldQty,
                newQuantity: newQty,
                reason: validateResult.transactionType
            }], { session });

            product.stock = newQty;
            await product.save({ session });
        }

        await session.commitTransaction();
        res.status(201).json({ status: "Success", data: transaction[0] });
    } catch (error) {
        await session.abortTransaction();
        res.status(400);
        throw new Error(error.message);
    } finally {
        session.endSession();
    }
});

/**
 * @desc Get all Transactions with their specific product names
 */
export const getAllTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find()
        .populate("items.productId", "name")
        .populate("items.unitId", "name")
        .sort({ createdAt: -1 });

    res.status(200).json({ status: "Success", data: transactions });
});

/**
 * @desc Get all Stock Movements with Product and Transaction context
 */
export const getStockMovements = asyncHandler(async (req, res) => {
    const stockMovements = await StockMovement.find()
        .populate("productId", "name")
        .populate("performedBy", "name")
        .sort({ createdAt: -1 });

    res.status(200).json({ status: "Success", data: stockMovements });
});

/**
 * @desc Update Credit Transaction Status
 * @route PUT api/v1/transactions/:id
 * @access Private/Admin
 * @param {Object} req.body expects
 * {ispaid}
 */
export const updateCreditStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
        res.status(404);
        throw new Error("Transaction not found");
    }

    transaction.isPaid = req.body.isPaid;
    await transaction.save();

    res.status(200).json({
        status: "Success",
        data: transaction
    });
});