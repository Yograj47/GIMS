import Transaction from "../models/Transaction.Model.js";
import asyncHandler from "express-async-handler";
import { transactionSchema } from "../validation/Transaction.validation.js";

/**
 * @desc Create a new transaction record
 * @route POST api/v1/transactions
 * @access Private/Staff
 * @param   {Object} req.body - Expects
 * { transactionType, items, grandTotal, isPaid, partyDetails, notes}
 */
export const createTransaction = asyncHandler(async (req, res) => {
    const validateResult = transactionSchema.parse(req.body);

    const transaction = await Transaction.create({
        ...validateResult,
        items: validateResult.items 
    });

    res.status(201).json({
        status: "Success",
        data: transaction
    });
});

/**
 * @desc Get all the transaction record
 * @route get api/v1/transactions
 * @access Private/Admin
 */
export const getAllTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find().sort({ createdAt: -1 });

    res.status(200).json({
        status: "Success",
        data: transactions
    });
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
    const { isPaid } = req.body; 

    const transaction = await Transaction.findById(id); 

    if (!transaction) { 
        res.status(404);
        throw new Error("Transaction not found");
    }

    transaction.isPaid = isPaid;
    await transaction.save();

    res.status(200).json({
        status: "Success",
        data: transaction
    });
});