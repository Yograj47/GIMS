import ProductUnit from '../models/ProductUnit.Model.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Get all product-unit conversions grouped by product
 * @route   GET /api/v1/product-units
 */
export const getAllProductUnits = asyncHandler(async (req, res) => {
    const productUnits = await ProductUnit.aggregate([
        {
            $lookup: {
                from: "products", 
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        {
            $lookup: {
                from: "units", 
                localField: "unitId",
                foreignField: "_id",
                as: "unit"
            }
        },
        { $unwind: "$unit" },
        {
            $group: {
                _id: "$productId",
                productName: { $first: "$product.name" },
                conversions: {
                    $push: {
                        _id: "$_id", 
                        unitName: "$unit.name",
                        shortName: "$unit.shortName",
                        multiplier: "$multiplier",
                        isDefault: "$isDefault",
                        isFractionable: "$isFractionable",
                        isActive: "$isActive"
                    }
                }
            }
        },
        { $sort: { productName: 1 } }
    ]);

    res.status(200).json({ status: "Success", data: productUnits });
});

/**
 * @desc   Create conversion
 */
export const createProductUnit = asyncHandler(async (req, res) => {
    const { productId, isDefault } = req.body;

    // 1. Logic Check: If this is set as default, unset previous default for this product
    if (isDefault) {
        await ProductUnit.updateMany(
            { productId }, 
            { isDefault: false }
        );
    }

    const newUnit = await ProductUnit.create(req.body);

    res.status(201).json({
        status: "Success",
        message: "Product unit created successfully",
        data: newUnit
    });
});

/**
 * @desc    Update conversion
 */
export const updateProductUnit = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isDefault, productId } = req.body;

    // 1. Safety: If updating to default, remove other defaults first
    if (isDefault) {
        const unit = await ProductUnit.findById(id);
        await ProductUnit.updateMany(
            { productId: unit.productId }, 
            { isDefault: false }
        );
    }

    const updated = await ProductUnit.findByIdAndUpdate(id, req.body, { 
        new: true, 
        runValidators: true 
    });

    if (!updated) {
        res.status(404);
        throw new Error("Conversion not found");
    }

    res.status(200).json({ status: "Success", data: updated });
});

/**
 * @desc    Delete a product-unit conversion
 * @route   DELETE /api/v1/product-units/:id
 * @access  Private
 */
export const deleteProductUnit = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const productUnit = await ProductUnit.findById(id);

    if (!productUnit) {
        res.status(404);
        throw new Error("Product unit conversion not found");
    }

    if (productUnit.isDefault) {
        res.status(400);
        throw new Error("Cannot delete the base unit. Please assign another unit as default first.");
    }

    await ProductUnit.findByIdAndDelete(id);

    res.status(200).json({
        status: "Success",
        message: "Product unit deleted successfully"
    });
});