import Unit from '../models/Unit.Model.js';
import Product from '../models/Product.Model.js';
import asyncHandler from 'express-async-handler';
import { unitSchema } from '../validation/Unit.validation.js';

/**
 * @desc    Create a new measurement unit
 * @route   POST /api/v1/units
 * @access  Private
 * @param   {Object} req.body - Expects { name, shortForm, unitType, baseUnit, isFractional }
 */
export const createUnit = asyncHandler(async (req, res) => {
    const validatedData = unitSchema.parse(req.body);

    const unitExists = await Unit.findOne({
        $or: [{ name: validatedData.name }, { shortForm: validatedData.shortForm }]
    });

    if (unitExists) {
        res.status(400);
        throw new Error("Unit with same name or short form already exists");
    }

    const unit = await Unit.create(validatedData);

    res.status(201).json({
        status: "success",
        data: unit
    });
});

/**
 * @desc    Get all active units sorted alphabetically
 * @route   GET /api/v1/units
 * @access  Private
 */
export const getUnits = asyncHandler(async (req, res) => {
    const units = await Unit.find({ isActive: true }).sort({ name: 1 }).select('-__v');

    res.status(200).json({
        status: "success",
        results: units.length,
        data: units
    });
});

/**
 * @desc    Get a single unit by its MongoDB ID
 * @route   GET /api/v1/units/:id
 * @access  Private
 */
export const getUnitById = asyncHandler(async (req, res) => {
    const unit = await Unit.findById(req.params.id).select('-__v');

    if (!unit) {
        res.status(404);
        throw new Error("Unit not found");
    }

    res.status(200).json({
        status: "success",
        data: unit
    });
});

/**
 * @desc    Update unit details by ID
 * @route   PUT /api/v1/units/:id
 * @access  Private
 */
export const updateUnitById = asyncHandler(async (req, res) => {
    const validatedData = unitSchema.parse(req.body);

    const updatedUnit = await Unit.findByIdAndUpdate(
        req.params.id,
        validatedData,
        { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedUnit) {
        res.status(404);
        throw new Error("Unit not found");
    }

    res.status(200).json({
        status: "success",
        data: updatedUnit
    });
});

/**
 * @desc    Soft delete a unit by deactivating it (checks for product dependencies)
 * @route   DELETE /api/v1/units/:id
 * @access  Private
 */
export const deleteUnitById = asyncHandler(async (req, res) => {
    // Check if any products use this unit to maintain referential integrity
    const productCount = await Product.countDocuments({ unit: req.params.id });

    if (productCount > 0) {
        res.status(400);
        throw new Error(`Cannot deactivate. This unit is currently used by ${productCount} products.`);
    }

    const unit = await Unit.findById(req.params.id);
    if (!unit) {
        res.status(404);
        throw new Error("Unit not found");
    }

    unit.isActive = false;
    await unit.save();

    res.status(200).json({
        status: "success",
        message: "Unit deactivated successfully"
    });
});