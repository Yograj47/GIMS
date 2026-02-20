import Transaction from "../models/Transaction.Model.js";
import Movement from "../models/Movement.Model.js";
import Product from "../models/Product.Model.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { transactionSchema } from "../validation/Transaction.validation.js";

/**
 * @desc Create a unified transaction (Purchase, Sale, Return) with automatic stock movement
 * @route POST /api/v1/transactions/
 * @access Private
 */
export const createUnifiedTransaction = asyncHandler(async (req, res) => {
    const validateResult = transactionSchema.parse(req.body);
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const transaction = await Transaction.create([{
            transactionType: validateResult.transactionType,
            items: validateResult.items,
            grandTotal: validateResult.grandTotal,
            isPaid: validateResult.isPaid,
            partyDetails: {
                name: validateResult.partyDetails?.name || "",
                phone: validateResult.partyDetails?.phone || ""
            },
            notes: validateResult.notes || ""
        }], { session });

        const transactionId = transaction[0]._id;

        for (const item of validateResult.items) {
            const product = await Product.findById(item.productId).session(session);
            if (!product) throw new Error(`Product ${item.productId} not found`);

            const isStockIN = ['Purchase', 'Return'].includes(validateResult.transactionType);

            const oldQty = Number(product.quantity) || 0;
            const stockImpact = Number(item.qty) * Number(item.multiplier);
            const newQty = isStockIN ? oldQty + stockImpact : oldQty - stockImpact;

            if (isNaN(newQty)) throw new Error(`Math Error for product ${product.name}`);

            await Movement.create([{
                productId: item.productId,
                transactionId: transactionId,
                performedBy: req.user.id,
                unitId: item.unitId,
                multiplier: item.multiplier,
                quantity: stockImpact,
                movementType: isStockIN ? 'IN' : 'OUT',
                oldQuantity: oldQty,
                newQuantity: newQty,
                reason: `${validateResult.transactionType}: ${item.qty} ${item.unitName || 'units'}`
            }], { session });

            product.quantity = newQty;
            await product.save({ session });
        }

        await session.commitTransaction();
        res.status(201).json({ status: "Success", data: transaction[0] });

    } catch (error) {
        if (session.inAtomicityTransition()) await session.abortTransaction();
        res.status(400);
        throw new Error(error.message);
    } finally {
        session.endSession();
    }
});

/**
 * @desc Get all Transactions with their specific product names
 * @route GET /api/v1/transactions/
 * @access Private
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
 * @route GET /api/v1/transactions/movements/
 * @access Private
 */
export const getMovements = asyncHandler(async (req, res) => {
    const results = await Movement.find()
        .populate("productId", "name")
        .populate("unitId", "name")
        .populate("performedBy", "name")
        .populate("transactionId", "transactionType grandTotal")
        .sort({ createdAt: -1 });

    res.status(200).json({ status: "Success", data: results });
});

/**
 * @desc Update Credit Transaction Status (Paid/Unpaid)
 * @route PUT /api/v1/transactions/:id/credit
 * @access Private
 * Note: This endpoint allows updating the payment status of a credit transaction. 
 * When marking as paid, you can also add notes (e.g., "Paid 500 now, rest later") which will be appended to existing notes.
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

/**
 * @desc Get movement history + current stock of products
 * @route GET /api/v1/transactions/movements/product-history/:productId
 * @access Private
 * Note: This endpoint retrieves the complete movement history of a specific product, including the user who performed each movement, the unit involved, and the old/new stock levels. This is crucial for inventory tracking and auditing purposes.
 */
export const getProductMovements = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const movements = await Movement.find({ productId })
        .populate("performedBy", "name")
        .populate("unitId", "name")
        .sort({ createdAt: -1 });

        console.log(movements);
        

    res.status(200).json({ status: "Success", data: movements });
});