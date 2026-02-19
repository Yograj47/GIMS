import Transaction from "../models/Transaction.Model.js";
import Movement from "../models/Movement.Model.js";
import Product from "../models/Product.Model.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { transactionSchema } from "../validation/Transaction.validation.js";

export const createUnifiedTransaction = asyncHandler(async (req, res) => {
    // 1. Validate with the updated Zod schema (includes multiplier)
    const validateResult = transactionSchema.parse(req.body);
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // 2. Create the Transaction record
        const transaction = await Transaction.create([validateResult], { session });

        for (const item of validateResult.items) {
            // 3. Find Product in current session
            const product = await Product.findById(item.productId).session(session);
            if (!product) throw new Error(`Product ${item.productId} not found`);

            // 4. Handle Movement Logic
            // 'Fixed' or 'Adjustment' logic: if you want 'Fixed' to be an increase, add it to isStockIN
            const isStockIN = ['Purchase', 'Return'].includes(validateResult.transactionType);

            // USE THE SNAPSHOT MULTIPLIER from validateResult (item.multiplier)
            // Reality: If selling 0.5kg and multiplier is 1000g, stockImpact = 500
            const stockImpact = item.qty * item.multiplier;

            const oldQty = product.stock;
            const newQty = isStockIN ? oldQty + stockImpact : oldQty - stockImpact;

            // 5. Create Stock Movement with Unit context
            await Movement.create([{
                productId: item.productId,
                transactionId: transaction[0]._id,
                performedBy: req.user._id,
                unitId: item.unitId, // Link the unit used
                multiplier: item.multiplier, // Snapshot multiplier
                quantity: stockImpact,
                movementType: isStockIN ? 'IN' : 'OUT',
                oldQuantity: oldQty,
                newQuantity: newQty,
                reason: `${validateResult.transactionType}: ${item.qty} ${item.unitName || 'units'}`
            }], { session });

            // 6. Update Product Stock
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
        .populate("items.unitId", "name symbol")
        .sort({ createdAt: -1 });
    res.status(200).json({ status: "Success", data: transactions });
});


/**
 * @desc Get all Stock Movements with Product, User, and Unit context
 */
export const getMovements = asyncHandler(async (req, res) => {
    const Movements = await Movement.find()
        .populate("productId", "name")      // See WHAT moved
        .populate("unitId", "name")         // See WHICH UNIT was used (Sack, KG, etc.)
        .populate("performedBy", "name")    // See WHO did it
        .populate("transactionId", "transactionType grandTotal") 
        .sort({ createdAt: -1 });

    res.status(200).json({ status: "Success", data: Movements });
});

/**
 * @desc Update Credit Transaction Status (Paid/Unpaid)
 */
export const updateCreditStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isPaid, notes } = req.body; // Allow updating notes when paying

    const transaction = await Transaction.findById(id);

    if (!transaction) {
        res.status(404);
        throw new Error("Transaction not found");
    }

    transaction.isPaid = isPaid;
    
    // If they provide a new note (e.g., "Paid 500 now, rest later"), append it
    if (notes) {
        transaction.notes = transaction.notes 
            ? `${transaction.notes} | Update: ${notes}` 
            : notes;
    }

    await transaction.save();

    res.status(200).json({
        status: "Success",
        data: transaction
    });
});