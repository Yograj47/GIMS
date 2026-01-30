import Supplier from "../models/Supplier.Model.js";
import ProductModel from "../models/Product.Model.js";
import asyncHandler from "express-async-handler";
import { supplierSchema } from "../validation/Supplier.validation.js";

/**
 * @desc    Create a new supplier
 * @route   POST /api/v1/suppliers
 * @access  Private
 * @param   {Object} req.body - Expects { name, contactInfo, address, isActive }
 */
export const createSupplier = asyncHandler(async (req, res) => {
    const validatedData = supplierSchema.parse(req.body);

    const supplier = await Supplier.create(validatedData);

    res.status(201).json({
        status: "success",
        data: supplier
    });
})

/**
 * @desc    Get all active suppliers sorted alphabetically
 * @route   GET /api/v1/suppliers
 * @access  Private
 */
export const getSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 }).select('-__v');

    res.status(200).json({
        status: "success",
        results: suppliers.length,
        data: suppliers
    });
 })

/**
 * @desc    Get a single supplier by its MongoDB ID
 * @route   GET /api/v1/suppliers/:id
 * @access  Private
 */
export const getSupplierById = asyncHandler(async (req, res) => { 
    const supplier = await Supplier.findById(req.params.id).select('-__v');

    if (!supplier) {
        res.status(404);
        throw new Error("Supplier not found");
    }

    const products = await ProductModel.find({ supplier: supplier._id });

    res.status(200).json({
        status: "success",
        data: { ...supplier.toObject(), products}
    });
})

/**
 * @desc    Update a supplier by its MongoDB ID
 * @route   PUT /api/v1/suppliers/:id
 * @access  Private
 * @param   {Object} req.body - Expects
 * {name, contactInfo, address, isActive }
 */
export const updateSupplier = asyncHandler(async (req, res) => {
    const validatedData = supplierSchema.partial().parse(req.body);

    const supplier = await Supplier.findByIdAndUpdate(
        req.params.id,
        { $set: validatedData },
        { new: true, runValidators: true }
    ).select('-__v');

    if (!supplier) {
        res.status(404);
        throw new Error("Supplier not found");
    }

    res.status(200).json({
        status: "success",
        data: supplier
    });

 })

/** 
 * @desc    Delete a supplier by its MongoDB ID
 * @route   DELETE /api/v1/suppliers/:id
 * @access  Private
 */ 
export const deleteSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.findByIdAndDelete(req.params.id).select('-__v');

    if (!supplier) {
        res.status(404);
        throw new Error("Supplier not found");
    }

    res.status(200).json({
        status: "success",
        data: supplier
    });
 })
