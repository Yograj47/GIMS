import StockMovement from "../models/StockMovement.Model.js";
import asyncHandler from "express-async-handler";
import { StockMovementSchema } from "../validation/StockMovement.validation.js";
import mongoose from "mongoose";

/**
 * @desc    Create a new stock movement record
 * @route   POST /api/v1/stock-movements
 * @access  Private/Admin
 * @param   {Object} req.body - Expects
 * { productId, quantity, movementType, date }
 */
export const createStockMovement = asyncHandler(async (req, res) => {
    const validateResult = StockMovementSchema.parse(req.body);

    const productExist = await mongoose.model('Products').exists({ _id: validateResult.productId });
    if (!productExist) {
        res.status(400);
        throw new Error("Product not found");
    }

    const stockMovement = await StockMovement.create({
        productId: validateResult.productId,
        performedBy: validateResult.performedBy,
        quantity: validateResult.quantity,
        movementType: validateResult.movementType,
        oldQuantity: validateResult.oldQuantity,
        newQuantity: validateResult.newQuantity,
        notes: validateResult.notes 
    });

    res.status(201).json({
        status: "Success",
        data: stockMovement
    });
});

/**
 * @desc    Get all stock movement records
 * @route   GET /api/v1/stock-movements
 * @access  Private/Admin
 */
export const getStockMovements = asyncHandler(async (req, res) => {
    const stockMovements = await StockMovement.find().sort({ date: -1 });

    res.status(200).json({
        status: "Success",
        results: stockMovements.length,
        data: stockMovements
    });
});
