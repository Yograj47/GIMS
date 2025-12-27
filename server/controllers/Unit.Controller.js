import asyncHandler from 'express-async-handler';
import Unit from '../models/Unit.Model.js';

/**
 * @desc    Create new Unit
 * @route   POST /api/v1/units
 * @access  Private
 */
export const createUnit = asyncHandler(async (req, res) => {
    const { name, shortForm, unitType, baseUnit, isFractional } = req.body;

    if (!name || !shortForm || !unitType) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }

    const unitExists = await Unit.findOne({
        $or: [{ name }, { shortForm }]
    });

    if (unitExists) {
        res.status(400);
        throw new Error("Unit with same name or short form already exists");
    }

    const unit = await Unit.create({
        name,
        shortForm,
        unitType,
        baseUnit: baseUnit ?? false,
        isFractional: isFractional ?? false
    });

    res.status(201).json(unit);
});

/**
 * @desc    Get all Units
 * @route   GET /api/v1/units
 * @access  Private
 */
export const getUnits = asyncHandler(async (req, res) => {
    const units = await Unit.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(units);
});

/**
 * @desc    Get Unit by ID
 * @route   GET /api/v1/units/:id
 * @access  Private
 */
export const getUnitById = asyncHandler(async (req, res) => {
    const unit = await Unit.findById(req.params.id);

    if (!unit) {
        res.status(404);
        throw new Error("Unit not found");
    }

    res.status(200).json(unit);
});

/**
 * @desc    Update Unit by ID
 * @route   PUT /api/v1/units/:id
 * @access  Private
 */
export const updateUnitById = asyncHandler(async (req, res) => {
    const { name, shortForm, unitType, baseUnit, isFractional, isActive } = req.body;

    const unit = await Unit.findById(req.params.id);

    if (!unit) {
        res.status(404);
        throw new Error("Unit not found");
    }

    if (name) unit.name = name;
    if (shortForm) unit.shortForm = shortForm;
    if (unitType) unit.unitType = unitType;
    if (baseUnit !== undefined) unit.baseUnit = baseUnit;
    if (isFractional !== undefined) unit.isFractional = isFractional;
    if (isActive !== undefined) unit.isActive = isActive;

    const updatedUnit = await unit.save();
    res.status(200).json(updatedUnit);
});

/**
 * @desc    Soft delete Unit by ID
 * @route   DELETE /api/v1/units/:id
 * @access  Private
 */
export const deleteUnitById = asyncHandler(async (req, res) => {
    const unit = await Unit.findById(req.params.id);

    if (!unit) {
        res.status(404);
        throw new Error("Unit not found");
    }

    unit.isActive = false;
    await unit.save();

    res.status(200).json({ message: "Unit deactivated successfully" });
});
