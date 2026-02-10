import asyncHandler from "express-async-handler";
import Product from "../models/Product.Model.js"
import Category from "../models/Category.Model.js"
import Unit from "../models/Unit.Model.js"
import { productSchema } from "../validation/Product.validation.js"

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
export const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find()
        .populate({
            path: "categoryId",
            select: "name"
        })
        .populate({
            path: "unitId",
            select: "name shortForm"
        })
        .populate({
            path: "supplierId",
            select: "name"
        })
        .lean();

    const response = products.map(p => ({
        _id: p._id,
        name: p.name,
        quantity: p.quantity,
        threshold: p.threshold,
        basePrice: p.basePrice,
        sellingPrice: p.sellingPrice,
        category: p.categoryId,
        unit: p.unitId,
        supplier: p.supplierId,
        isActive: p.isActive,
        createdAt: p.createdAt
    }))

    res.status(200).json({
        status: "Success",
        data: response
    })


})

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