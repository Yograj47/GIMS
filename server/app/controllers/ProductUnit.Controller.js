import ProductUnit from '../models/ProductUnit.Model.js';
import asyncHandler from 'express-async-handler';
import { createLog } from "../config/Logger.js"

/**
 * @desc    Get all product-unit conversions grouped by product
 * @route   GET /api/v1/product-units
 */
export const getAllProductUnits = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const search = req.query.search || '';
    const shouldPaginate = req.query.paginate !== 'false';

    const pipeline = [
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        ...(search ? [{
            $match: {
                "product.name": { $regex: search, $options: 'i' }
            }
        }] : []),
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
    ];

    let productUnits;
    let totalItems;

    if (shouldPaginate) {
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await ProductUnit.aggregate(countPipeline);
        totalItems = countResult[0]?.total || 0;

        pipeline.push({ $skip: (page - 1) * limit });
        pipeline.push({ $limit: limit });
    }

    productUnits = await ProductUnit.aggregate(pipeline);

    res.status(200).json({
        status: "Success",
        data: productUnits,
        meta: shouldPaginate ? {
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            itemsPerPage: limit
        } : {
            totalItems: productUnits.length,
            paginationDisabled: true
        }
    });

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

    // LOG: Conversion Creation
    await createLog(
        req.user.id,
        "CREATE",
        "INVENTORY_CONFIG",
        `Added new unit conversion (Multiplier: ${newUnit.multiplier}) for Product ID: ${productId}`
    );

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
    const { isDefault } = req.body;

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

    // LOG: Conversion Update
    await createLog(
        req.user.id,
        "UPDATE",
        "INVENTORY_CONFIG",
        `Updated unit conversion parameters for Product ID: ${updated.productId}`
    );

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

    // LOG: Conversion Deletion
    await createLog(
        req.user.id,
        "DELETE",
        "INVENTORY_CONFIG",
        `Removed unit conversion (Multiplier: ${productUnit.multiplier}) from Product ID: ${productUnit.productId}`
    );

    res.status(200).json({
        status: "Success",
        message: "Product unit deleted successfully"
    });
});