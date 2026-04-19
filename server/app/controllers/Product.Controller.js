import asyncHandler from "express-async-handler";
import Product from "../models/Product.Model.js"
import Category from "../models/Category.Model.js"
import Unit from "../models/Unit.Model.js"
import { productSchema } from "../validation/Product.validation.js"
import ProductUnit from "../models/ProductUnit.Model.js";
import { createLog } from "../config/Logger.js"
import mongoose from "mongoose";

/** 
 * @desc    Create new product
 * @route   POST /api/v1/products
 * @access  Private
 */
export const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        categoryId,
        unitId,
        quantity,
        threshold,
        supplierId,
        basePrice,
        sellingPrice
    } = productSchema.parse(req.body);


    const categoryExist = await Category.findById(categoryId);
    if (!categoryExist) {
        res.status(400);
        throw new Error("Category not found");
    }

    const unitExist = await Unit.findById(unitId);
    if (!unitExist) {
        res.status(400);
        throw new Error("Unit not found");
    }

    const product = await Product.create({
        name,
        categoryId,
        unitId,
        quantity,
        threshold,
        supplierId,
        basePrice,
        sellingPrice
    });

    await ProductUnit.create({
        productId: product._id,
        unitId: unitId,
        multiplier: unitExist.multiplierToBase,
        isDefault: true,
        isFractionable: unitExist.isFractional,
        isActive: true
    });

    // LOG: Product Entry
    await createLog(
        req.user.id,
        "CREATE",
        "INVENTORY",
        `Cataloged new product: ${name} with initial stock of ${product.quantity}`
    );

    res.status(201).json({
        status: "Success",
        data: product
    });
});

/**
 * @desc    Get all products with Advanced Filtering
 * @route   GET /api/v1/products
 * @access  Private
 */
export const getProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const shouldPaginate = req.query.paginate !== 'false';

    const stockLevel = (req.query.stockLevel &&
        req.query.stockLevel !== 'All Levels' &&
        req.query.stockLevel !== '')
        ? req.query.stockLevel
        : null;

    // 1. Build Initial Match (Filters)
    const matchConditions = {};

    // Filter by exact Category ID if provided from dropdown
    if (category && mongoose.Types.ObjectId.isValid(category)) {
        matchConditions.categoryId = new mongoose.Types.ObjectId(category);
    }

    // Filter by Stock Level
    if (stockLevel === "low") matchConditions.$expr = { $lte: ["$quantity", "$threshold"] };
    if (stockLevel === "healthy") matchConditions.$expr = { $gt: ["$quantity", "$threshold"] };
    if (stockLevel === "out") matchConditions.quantity = { $lte: 0 };

    // 2. Build Pipeline
    const pipeline = [
        { $match: matchConditions },

        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "categoryDoc"
            }
        },
        { $unwind: "$categoryDoc" },

        {
            $lookup: {
                from: "units",
                localField: "unitId",
                foreignField: "_id",
                as: "unitDoc"
            }
        },
        { $unwind: "$unitDoc" },
        {
            $lookup: {
                from: "suppliers",
                localField: "supplierId",
                foreignField: "_id",
                as: "supplierDoc"
            }
        },
        {
            $unwind: {
                path: "$supplierDoc",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "productunits",
                let: { productId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$productId", "$$productId"] },
                            isActive: true
                        }
                    },
                    {
                        $lookup: {
                            from: "units",
                            localField: "unitId",
                            foreignField: "_id",
                            as: "unitDoc"
                        }
                    },
                    { $unwind: "$unitDoc" },
                    {
                        $project: {
                            _id: 1,
                            multiplier: 1,
                            isDefault: 1,
                            isFractionable: 1,
                            unitId: {
                                _id: "$unitDoc._id",
                                name: "$unitDoc.name",
                                shortForm: "$unitDoc.shortForm",
                                multiplierToBase: "$unitDoc.multiplierToBase",
                                baseUnit: "$unitDoc.baseUnit"
                            }
                        }
                    }
                ],
                as: "sellingUnits"
            }
        },

    ];

    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { 'categoryDoc.name': { $regex: search, $options: 'i' } }
                ]
            }
        });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    pipeline.push(
        {
            $project: {
                _id: 1,
                name: 1,
                quantity: 1,
                threshold: 1,
                basePrice: 1,
                sellingPrice: 1,
                isActive: 1,
                createdAt: 1,
                category: { _id: "$categoryDoc._id", name: "$categoryDoc.name" },
                unit: {
                    _id: "$unitDoc._id",
                    name: "$unitDoc.name",
                    shortForm: "$unitDoc.shortForm",
                    multiplierToBase: "$unitDoc.multiplierToBase"
                },
                supplier: {
                    $cond: {
                        if: { $ifNull: ["$supplierDoc._id", false] },
                        then: { _id: "$supplierDoc._id", name: "$supplierDoc.name" },
                        else: null
                    }
                },
                sellingUnits: 1,
                baseUnit: {
                    $let: {
                        vars: {
                            found: {
                                $first: {
                                    $filter: {
                                        input: "$sellingUnits",
                                        cond: { $eq: ["$$this.multiplier", 1] }
                                    }
                                }
                            }
                        },
                        in: {
                            $cond: {
                                if: { $ifNull: ["$$found", false] },
                                then: {
                                    name: "$$found.unitId.name",
                                    shortForm: "$$found.unitId.shortForm"
                                },
                                else: null
                            }
                        }
                    }
                }
            }
        }
    );

    // 3. Execution & Pagination Logic
    let results;
    let totalItems;

    if (shouldPaginate) {
        const countResult = await Product.aggregate([...pipeline, { $count: "total" }]);
        totalItems = countResult[0]?.total || 0;

        pipeline.push({ $skip: (page - 1) * limit });
        pipeline.push({ $limit: limit });
    }

    results = await Product.aggregate(pipeline);

    // 4. Return Response
    res.status(200).json({
        status: "Success",
        data: results,
        meta: shouldPaginate ? {
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            itemsPerPage: limit
        } : {
            totalItems: results.length,
            paginationDisabled: true
        }
    });
});

/**
 * @desc Get product by id
 * @route GET /api/v1/products/:productId
 * @param  {Object} req - expects {productId}
 * @access  Private
 */
export const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findOne({ _id: productId })
        .populate("categoryId", "name")
        .populate("unitId", "name shortForm")
        .populate("supplierId", "name")
        .lean();

    if (!product) {
        res.status(400);
        throw new Error("Product not found");
    }

    const response = {
        ...product,
        category: product.categoryId,
        unit: product.unitId,
        supplier: product.supplierId,
        categoryId: undefined,
        unitId: undefined,
        supplierId: undefined
    };

    res.status(200).json({
        status: "Success",
        data: response
    });
})

/**
 * @desc Update product by id
 * @route PUT /api/v1/products/:productId
 * @param  {Object} req - expects {productId}  
 * @access  Private
 */
export const UpdateProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    // 1. Validate the incoming update data with Zod
    const validatedData = productSchema.parse(req.body);

    // 2. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // 3. Update and return the new document
    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        validatedData,
        { new: true, runValidators: true }
    ).lean();

    // LOG: Product Modification
    await createLog(
        req.user.id,
        "UPDATE",
        "INVENTORY",
        `Modified product specifications for: ${updatedProduct.name} (Stock: ${updatedProduct.quantity})`
    );

    res.status(200).json({
        status: "Success",
        data: updatedProduct
    });
})

/**
 * @desc DELETE product by id
 * @route DELETE /api/v1/products/:productId
 * @param  {Object} req - expects {productId}
 * @access  Private
 */
export const deleteProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // LOG: Product Removal
    await createLog(
        req.user.id,
        "DELETE",
        "INVENTORY",
        `Permanently purged product from catalog: ${product.name}`
    );

    res.status(200).json({
        status: "Success",
        message: "Product deleted successfully"
    });
})