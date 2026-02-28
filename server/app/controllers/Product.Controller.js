import asyncHandler from "express-async-handler";
import Product from "../models/Product.Model.js"
import Category from "../models/Category.Model.js"
import Unit from "../models/Unit.Model.js"
import { productSchema } from "../validation/Product.validation.js"
import ProductUnit from "../models/ProductUnit.Model.js";

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

    res.status(201).json({
        status: "Success",
        data: product
    });
});


/**
 * @desc    Get all the products
 * @route   GET /api/v1/products
 * @access  Private
 */
/**
 * @desc    Get all products with Advanced Filtering
 * @route   GET /api/v1/products
 * @access  Private
 */
export const getProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const shouldPaginate = req.query.paginate !== 'false';

    const stockLevel = (req.query.stockLevel &&
        req.query.stockLevel !== 'All Levels' &&
        req.query.stockLevel !== '')
        ? req.query.stockLevel
        : null;

    // 1. Define Filter Conditions
    const conditions = [
        ...(search ? [{
            name: { $regex: search, $options: 'i' }
        }] : []),
        ...(stockLevel === "Low Stock" ? [{
            $expr: { $lte: ["$quantity", "$threshold"] }
        }] : []),
        ...(stockLevel === "Healthy" ? [{
            $expr: { $gt: ["$quantity", "$threshold"] }
        }] : [])
    ];

    // 2. Build Pipeline
    const pipeline = [
        ...(conditions.length > 0 ? [{ $match: { $and: conditions } }] : []),
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category"
            }
        },
        { $unwind: "$category" },
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
            $project: {
                _id: 1,
                name: 1,
                quantity: 1,
                threshold: 1,
                basePrice: 1,
                sellingPrice: 1,
                isActive: 1,
                createdAt: 1,
                category: { _id: "$category._id", name: "$category.name" },
                unit: { _id: "$unit._id", name: "$unit.name", shortForm: "$unit.shortForm" }
            }
        },
        { $sort: { createdAt: -1 } }
    ];

    // 3. Handle Pagination
    let results;
    let totalItems;

    if (shouldPaginate) {
        const countResult = await Product.aggregate([...pipeline, { $count: "total" }]);
        totalItems = countResult[0]?.total || 0;

        pipeline.push({ $skip: (page - 1) * limit });
        pipeline.push({ $limit: limit });
    }

    results = await Product.aggregate(pipeline);

    // 4. Return Theme-Consistent Response
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

    res.status(200).json({
        status: "Success",
        message: "Product deleted successfully"
    });
})